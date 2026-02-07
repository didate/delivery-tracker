package com.delivery.shared.search.criteria;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Enhanced enumeration for search operations supporting advanced query capabilities.
 * Provides support for various comparison operations, pattern matching, and logical operations.
 */
public enum SearchOperation {
    EQUALITY,
    NEGATION,
    GREATER_THAN,
    GREATER_THAN_OR_EQUAL,
    LESS_THAN,
    LESS_THAN_OR_EQUAL,
    LIKE,
    STARTS_WITH,
    ENDS_WITH,
    CONTAINS,
    IN,
    NOT_IN,
    IS_NULL,
    IS_NOT_NULL,
    BETWEEN;

    public static final String[] SIMPLE_OPERATION_SET = { ":", "!", ">", ">=", "<", "<=", "~", "in", "!in", "null", "!null", "between" };

    public static final String OR_PREDICATE_FLAG = "'";

    public static final String ZERO_OR_MORE_REGEX = "*";

    public static final String OR_OPERATOR = "OR";

    public static final String AND_OPERATOR = "AND";

    public static final String LEFT_PARENTHESIS = "(";

    public static final String RIGHT_PARENTHESIS = ")";

    /**
     * Gets the simple operation from a character input.
     * Enhanced to support more operations like >= and <=
     */
    public static SearchOperation getSimpleOperation(final String input) {
        if (input == null || input.isEmpty()) {
            return null;
        }

        switch (input) {
            case ":":
                return EQUALITY;
            case "!":
                return NEGATION;
            case ">":
                return GREATER_THAN;
            case ">=":
                return GREATER_THAN_OR_EQUAL;
            case "<":
                return LESS_THAN;
            case "<=":
                return LESS_THAN_OR_EQUAL;
            case "~":
                return LIKE;
            case "in":
                return IN;
            case "!in":
                return NOT_IN;
            case "null":
                return IS_NULL;
            case "!null":
                return IS_NOT_NULL;
            case "between":
                return BETWEEN;
            default:
                return null;
        }
    }

    /**
     * Legacy method for backward compatibility
     */
    public static SearchOperation getSimpleOperation(final char input) {
        return getSimpleOperation(String.valueOf(input));
    }

    /**
     * Gets all supported operation symbols
     */
    public static Set<String> getAllOperations() {
        return Arrays.stream(SIMPLE_OPERATION_SET).collect(Collectors.toSet());
    }

    /**
     * Checks if the operation requires multiple values (e.g., IN, BETWEEN)
     */
    public boolean isMultiValue() {
        return this == IN || this == NOT_IN || this == BETWEEN;
    }

    /**
     * Checks if the operation is a null check
     */
    public boolean isNullCheck() {
        return this == IS_NULL || this == IS_NOT_NULL;
    }

    /**
     * Checks if the operation supports pattern matching
     */
    public boolean isPatternMatch() {
        return this == LIKE || this == STARTS_WITH || this == ENDS_WITH || this == CONTAINS;
    }
}
