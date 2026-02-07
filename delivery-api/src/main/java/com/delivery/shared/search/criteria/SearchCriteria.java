package com.delivery.shared.search.criteria;

import java.util.Arrays;
import java.util.List;

/**
 * Enhanced search criteria class supporting advanced search operations.
 * Provides improved validation, type safety, and support for complex queries.
 */
public class SearchCriteria {

    private String key;
    private SearchOperation operation;
    private Object value;
    private boolean orPredicate;
    private boolean caseSensitive = false;

    public SearchCriteria() {}

    public SearchCriteria(String key, SearchOperation operation, Object value) {
        this.key = key;
        this.operation = operation;
        this.value = value;
    }

    public SearchCriteria(String orPredicate, String key, SearchOperation operation, Object value) {
        this.key = key;
        this.operation = operation;
        this.value = value;
        this.orPredicate = orPredicate != null && orPredicate.equals(SearchOperation.OR_PREDICATE_FLAG);
    }

    public SearchCriteria(String key, SearchOperation operation, Object value, boolean caseSensitive) {
        this.key = key;
        this.operation = operation;
        this.value = value;
        this.caseSensitive = caseSensitive;
    }

    /**
     * Static factory method for creating equality criteria
     */
    public static SearchCriteria equal(String key, Object value) {
        return new SearchCriteria(key, SearchOperation.EQUALITY, value);
    }

    /**
     * Static factory method for creating LIKE criteria
     */
    public static SearchCriteria like(String key, String value) {
        return new SearchCriteria(key, SearchOperation.LIKE, value);
    }

    /**
     * Static factory method for creating contains criteria
     */
    public static SearchCriteria contains(String key, String value) {
        return new SearchCriteria(key, SearchOperation.CONTAINS, value);
    }

    /**
     * Static factory method for creating IN criteria
     */
    public static SearchCriteria in(String key, Object... values) {
        return new SearchCriteria(key, SearchOperation.IN, Arrays.asList(values));
    }

    /**
     * Static factory method for creating range criteria
     */
    public static SearchCriteria between(String key, Object start, Object end) {
        return new SearchCriteria(key, SearchOperation.BETWEEN, Arrays.asList(start, end));
    }

    /**
     * Validates if the criteria is properly configured
     */
    public boolean isValid() {
        if (key == null || key.trim().isEmpty()) {
            return false;
        }
        if (operation == null) {
            return false;
        }
        if (operation.isNullCheck()) {
            return true; // Null checks don't need a value
        }
        if (operation == SearchOperation.BETWEEN) {
            return value instanceof List && ((List<?>) value).size() == 2;
        }
        if (operation.isMultiValue()) {
            return value instanceof List && !((List<?>) value).isEmpty();
        }
        return value != null;
    }

    /**
     * Gets the value as a list for multi-value operations
     */
    @SuppressWarnings("unchecked")
    public List<Object> getValueAsList() {
        if (value instanceof List) {
            return (List<Object>) value;
        }
        return Arrays.asList(value);
    }

    /**
     * Gets the string representation of the value
     */
    public String getValueAsString() {
        if (value == null) {
            return null;
        }
        return value.toString();
    }

    // Getters and Setters
    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public SearchOperation getOperation() {
        return operation;
    }

    public void setOperation(SearchOperation operation) {
        this.operation = operation;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public boolean isOrPredicate() {
        return orPredicate;
    }

    public void setOrPredicate(boolean orPredicate) {
        this.orPredicate = orPredicate;
    }

    public boolean isCaseSensitive() {
        return caseSensitive;
    }

    public void setCaseSensitive(boolean caseSensitive) {
        this.caseSensitive = caseSensitive;
    }

    @Override
    public String toString() {
        return (
            "SearchCriteria{" +
            "key='" +
            key +
            '\'' +
            ", operation=" +
            operation +
            ", value=" +
            value +
            ", orPredicate=" +
            orPredicate +
            ", caseSensitive=" +
            caseSensitive +
            '}'
        );
    }
}
