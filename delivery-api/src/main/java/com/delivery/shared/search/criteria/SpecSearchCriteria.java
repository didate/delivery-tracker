package com.delivery.shared.search.criteria;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Enhanced specialized search criteria with improved wildcard handling and validation.
 * Used primarily by the CriteriaParser for parsing string-based search expressions.
 */
public class SpecSearchCriteria {

    private static final Logger log = LoggerFactory.getLogger(SpecSearchCriteria.class);

    private String key;
    private SearchOperation operation;
    private Object value;
    private boolean orPredicate;

    public SpecSearchCriteria() {}

    public SpecSearchCriteria(String key, SearchOperation operation, Object value) {
        this.key = key;
        this.operation = operation;
        this.value = value;
    }

    public SpecSearchCriteria(String orPredicate, String key, SearchOperation operation, Object value) {
        this.orPredicate = orPredicate != null && orPredicate.equals(SearchOperation.OR_PREDICATE_FLAG);
        this.key = key;
        this.operation = operation;
        this.value = value;
    }

    /**
     * Enhanced constructor that processes wildcards and converts simple operations to complex ones
     */
    public SpecSearchCriteria(String key, String operation, String prefix, String value, String suffix) {
        this.key = key;
        this.value = value;

        SearchOperation op = SearchOperation.getSimpleOperation(operation);
        if (op != null) {
            if (op == SearchOperation.EQUALITY) {
                // Process wildcard patterns
                op = processWildcardOperation(prefix, suffix);
            }
            this.operation = op;
        } else {
            log.warn("Unsupported operation: {}", operation);
            this.operation = SearchOperation.EQUALITY; // Default fallback
        }
    }

    /**
     * Determines the appropriate search operation based on wildcard patterns
     */
    private SearchOperation processWildcardOperation(String prefix, String suffix) {
        final boolean startWithAsterisk = prefix != null && prefix.contains(SearchOperation.ZERO_OR_MORE_REGEX);
        final boolean endWithAsterisk = suffix != null && suffix.contains(SearchOperation.ZERO_OR_MORE_REGEX);

        if (startWithAsterisk && endWithAsterisk) {
            return SearchOperation.CONTAINS;
        } else if (startWithAsterisk) {
            return SearchOperation.ENDS_WITH;
        } else if (endWithAsterisk) {
            return SearchOperation.STARTS_WITH;
        }

        return SearchOperation.EQUALITY;
    }

    /**
     * Converts this SpecSearchCriteria to a standard SearchCriteria
     */
    public SearchCriteria toSearchCriteria() {
        SearchCriteria criteria = new SearchCriteria(key, operation, value);
        criteria.setOrPredicate(orPredicate);
        return criteria;
    }

    /**
     * Validates that this criteria is properly formed
     */
    public boolean isValid() {
        if (key == null || key.trim().isEmpty()) {
            log.debug("Invalid criteria: missing or empty key");
            return false;
        }

        if (operation == null) {
            log.debug("Invalid criteria: missing operation for key {}", key);
            return false;
        }

        // Null checks don't need a value
        if (operation.isNullCheck()) {
            return true;
        }

        if (value == null) {
            log.debug("Invalid criteria: missing value for key {} with operation {}", key, operation);
            return false;
        }

        return true;
    }

    /**
     * Gets the value as a string, handling null values
     */
    public String getValueAsString() {
        return value != null ? value.toString() : null;
    }

    // Getters and Setters
    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public SearchOperation getOperation() {
        return operation;
    }

    public void setOperation(SearchOperation operation) {
        this.operation = operation;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public boolean isOrPredicate() {
        return orPredicate;
    }

    public void setOrPredicate(boolean orPredicate) {
        this.orPredicate = orPredicate;
    }

    @Override
    public String toString() {
        return (
            "SpecSearchCriteria{" +
            "key='" +
            key +
            '\'' +
            ", operation=" +
            operation +
            ", value=" +
            value +
            ", orPredicate=" +
            orPredicate +
            '}'
        );
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        SpecSearchCriteria that = (SpecSearchCriteria) o;

        if (orPredicate != that.orPredicate) return false;
        if (!key.equals(that.key)) return false;
        if (operation != that.operation) return false;
        return value != null ? value.equals(that.value) : that.value == null;
    }

    @Override
    public int hashCode() {
        int result = key.hashCode();
        result = 31 * result + operation.hashCode();
        result = 31 * result + (value != null ? value.hashCode() : 0);
        result = 31 * result + (orPredicate ? 1 : 0);
        return result;
    }
}
