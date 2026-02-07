package com.delivery.shared.search.criteria;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Enhanced criteria parser with improved error handling and support for more complex queries.
 * Supports parsing of complex search expressions with proper operator precedence.
 */
public class CriteriaParser {

    private static final Logger log = LoggerFactory.getLogger(CriteriaParser.class);

    private static final Map<String, Operator> OPERATORS;

    // Enhanced regex pattern to support more operations including >=, <=, in, etc.
    // Updated to support wildcards, special characters in values, and nested field paths (e.g., direction.id)
    private static final Pattern SPEC_CRITERIA_REGEX = Pattern.compile(
        "^([\\w.]+?)(>=|<=|>|<|:|!|~|in|!in|null|!null|between)(\\*?)([^\\s]*?)(\\*?)$"
    );

    private enum Operator {
        OR(1),
        AND(2);

        final int precedence;

        Operator(int precedence) {
            this.precedence = precedence;
        }
    }

    static {
        Map<String, Operator> tempMap = new HashMap<>();
        tempMap.put("AND", Operator.AND);
        tempMap.put("OR", Operator.OR);
        tempMap.put("and", Operator.AND);
        tempMap.put("or", Operator.OR);
        tempMap.put("&&", Operator.AND);
        tempMap.put("||", Operator.OR);

        OPERATORS = Collections.unmodifiableMap(tempMap);
    }

    /**
     * Checks if the current operator has higher or equal precedence than the previous one
     */
    private static boolean isHigherPrecedenceOperator(String currentOp, String previousOp) {
        return OPERATORS.containsKey(previousOp) && OPERATORS.get(previousOp).precedence >= OPERATORS.get(currentOp).precedence;
    }

    /**
     * Parses a search parameter string into a deque of search criteria and operators.
     * Uses the Shunting Yard algorithm for proper operator precedence.
     *
     * @param searchParam the search parameter string to parse
     * @return a deque containing the parsed criteria in postfix notation
     */
    public Deque<Object> parse(String searchParam) {
        if (searchParam == null || searchParam.trim().isEmpty()) {
            log.warn("Empty or null search parameter provided");
            return new LinkedList<>();
        }

        Deque<Object> output = new LinkedList<>();
        Deque<String> operatorStack = new LinkedList<>();

        try {
            String[] tokens = tokenize(searchParam);

            for (String token : tokens) {
                if (token.trim().isEmpty()) {
                    continue;
                }

                if (OPERATORS.containsKey(token)) {
                    processOperator(token, output, operatorStack);
                } else if (token.equals(SearchOperation.LEFT_PARENTHESIS)) {
                    operatorStack.push(SearchOperation.LEFT_PARENTHESIS);
                } else if (token.equals(SearchOperation.RIGHT_PARENTHESIS)) {
                    processRightParenthesis(output, operatorStack);
                } else {
                    processCriteria(token, output);
                }
            }

            // Pop remaining operators from stack and add to end of queue
            while (!operatorStack.isEmpty()) {
                String operator = operatorStack.pop();
                if (!operator.equals(SearchOperation.LEFT_PARENTHESIS)) {
                    output.addLast(operator); // Add to end of queue, not beginning
                }
            }
        } catch (Exception e) {
            log.error("Error parsing search parameter: {}", searchParam, e);
            return new LinkedList<>(); // Return empty deque on error
        }

        return output;
    }

    /**
     * Tokenizes the search parameter string, handling quoted strings and operators
     */
    private String[] tokenize(String searchParam) {
        // Enhanced tokenization to handle quoted strings and complex operators
        List<String> tokens = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder currentToken = new StringBuilder();

        for (int i = 0; i < searchParam.length(); i++) {
            char c = searchParam.charAt(i);

            if (c == '"' || c == '\'') {
                inQuotes = !inQuotes;
                if (!inQuotes && currentToken.length() > 0) {
                    tokens.add(currentToken.toString());
                    currentToken.setLength(0);
                }
            } else if (!inQuotes && Character.isWhitespace(c)) {
                if (currentToken.length() > 0) {
                    tokens.add(currentToken.toString());
                    currentToken.setLength(0);
                }
            } else {
                currentToken.append(c);
            }
        }

        if (currentToken.length() > 0) {
            tokens.add(currentToken.toString());
        }

        return tokens.toArray(new String[0]);
    }

    /**
     * Processes an operator token according to the Shunting Yard algorithm
     */
    private void processOperator(String token, Deque<Object> output, Deque<String> operatorStack) {
        while (
            !operatorStack.isEmpty() &&
            !operatorStack.peek().equals(SearchOperation.LEFT_PARENTHESIS) &&
            isHigherPrecedenceOperator(token, operatorStack.peek())
        ) {
            String poppedOperator = operatorStack.pop();
            output.addLast(normalizeOperator(poppedOperator)); // Add to end for proper postfix order
        }
        operatorStack.push(token);
    }

    /**
     * Processes a right parenthesis token
     */
    private void processRightParenthesis(Deque<Object> output, Deque<String> operatorStack) {
        while (!operatorStack.isEmpty() && !operatorStack.peek().equals(SearchOperation.LEFT_PARENTHESIS)) {
            String operator = operatorStack.pop();
            output.addLast(normalizeOperator(operator)); // Add to end for proper postfix order
        }

        if (!operatorStack.isEmpty()) {
            operatorStack.pop(); // Remove the left parenthesis
        } else {
            log.warn("Mismatched parentheses in search expression");
        }
    }

    /**
     * Processes a search criteria token
     */
    private void processCriteria(String token, Deque<Object> output) {
        Matcher matcher = SPEC_CRITERIA_REGEX.matcher(token);
        if (matcher.find()) {
            String key = matcher.group(1);
            String operation = matcher.group(2);
            String prefix = matcher.groupCount() > 2 ? matcher.group(3) : null;
            String value = matcher.groupCount() > 3 ? matcher.group(4) : null;
            String suffix = matcher.groupCount() > 4 ? matcher.group(5) : null;

            SpecSearchCriteria criteria = new SpecSearchCriteria(key, operation, prefix, value, suffix);
            output.addLast(criteria); // Add to end to maintain proper order
        } else {
            log.warn("Unable to parse criteria token: {}", token);
        }
    }

    /**
     * Normalizes operator strings to standard format
     */
    private String normalizeOperator(String operator) {
        if ("AND".equalsIgnoreCase(operator) || "&&".equals(operator)) {
            return SearchOperation.AND_OPERATOR;
        } else if ("OR".equalsIgnoreCase(operator) || "||".equals(operator)) {
            return SearchOperation.OR_OPERATOR;
        }
        return operator;
    }

    /**
     * Validates that the parsed criteria are properly formatted
     */
    public boolean validateCriteria(Deque<Object> criteria) {
        if (criteria.isEmpty()) {
            return true;
        }

        int criteriaCount = 0;
        int operatorCount = 0;

        for (Object item : criteria) {
            if (item instanceof SpecSearchCriteria) {
                criteriaCount++;
            } else if (item instanceof String) {
                String str = (String) item;
                if (SearchOperation.AND_OPERATOR.equals(str) || SearchOperation.OR_OPERATOR.equals(str)) {
                    operatorCount++;
                }
            }
        }

        // For valid criteria, we should have exactly (criteria - 1) operators
        boolean isValid = (criteriaCount == 0) || (operatorCount == criteriaCount - 1);

        if (!isValid) {
            log.warn("Invalid criteria structure: {} criteria, {} operators", criteriaCount, operatorCount);
        }

        return isValid;
    }

    /**
     * Converts the parsed deque to a more readable string representation
     */
    public String toString(Deque<Object> criteria) {
        StringBuilder sb = new StringBuilder();
        sb.append("Parsed Criteria: [");

        boolean first = true;
        for (Object item : criteria) {
            if (!first) {
                sb.append(", ");
            }
            sb.append(item.toString());
            first = false;
        }

        sb.append("]");
        return sb.toString();
    }
}
