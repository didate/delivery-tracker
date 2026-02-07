package com.delivery.shared.search;

import com.delivery.shared.search.criteria.SearchCriteria;
import com.delivery.shared.search.criteria.SearchOperation;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.domain.Specification;

/**
 * Enhanced specification builder with fluent API and improved functionality.
 * Provides a more intuitive way to build complex search specifications.
 */
public class SpecificationBuilder<T> {

    private final Logger log = LoggerFactory.getLogger(SpecificationBuilder.class);
    private final List<SearchCriteria> params;
    private List<String> allowedFields;

    public SpecificationBuilder() {
        this.params = new ArrayList<>();
        this.allowedFields = null;
    }

    public SpecificationBuilder(List<String> allowedFields) {
        this.params = new ArrayList<>();
        this.allowedFields = allowedFields;
    }

    /**
     * Sets the allowed fields for validation
     */
    public SpecificationBuilder<T> withAllowedFields(List<String> allowedFields) {
        this.allowedFields = allowedFields;
        return this;
    }

    /**
     * Adds a search criterion with the specified parameters
     */
    public SpecificationBuilder<T> with(String key, String operation, Object value, String prefix, String suffix) {
        return with(null, key, operation, value, prefix, suffix);
    }

    /**
     * Adds a search criterion with OR predicate support
     */
    public SpecificationBuilder<T> with(String orPredicate, String key, String operation, Object value, String prefix, String suffix) {
        // Validate field if allowed fields are specified
        if (!isFieldAllowed(key)) {
            log.warn("Field '{}' is not allowed for searching", key);
            throw new IllegalArgumentException("Field '" + key + "' is not allowed for searching");
        }

        SearchOperation op = SearchOperation.getSimpleOperation(operation);
        if (op != null) {
            if (op == SearchOperation.EQUALITY) {
                // Handle wildcard operations for EQUALITY
                final boolean startWithAsterisk = prefix != null && prefix.contains(SearchOperation.ZERO_OR_MORE_REGEX);
                final boolean endWithAsterisk = suffix != null && suffix.contains(SearchOperation.ZERO_OR_MORE_REGEX);

                if (startWithAsterisk && endWithAsterisk) {
                    op = SearchOperation.CONTAINS;
                } else if (startWithAsterisk) {
                    op = SearchOperation.ENDS_WITH;
                } else if (endWithAsterisk) {
                    op = SearchOperation.STARTS_WITH;
                }
            }
            params.add(new SearchCriteria(orPredicate, key, op, value));
        } else {
            log.warn("Unsupported operation: {}", operation);
        }
        return this;
    }

    /**
     * Fluent API methods for common operations
     */
    public SpecificationBuilder<T> equal(String key, Object value) {
        return addCriteria(SearchCriteria.equal(key, value));
    }

    public SpecificationBuilder<T> notEqual(String key, Object value) {
        return addCriteria(new SearchCriteria(key, SearchOperation.NEGATION, value));
    }

    public SpecificationBuilder<T> like(String key, String value) {
        return addCriteria(SearchCriteria.like(key, value));
    }

    public SpecificationBuilder<T> contains(String key, String value) {
        return addCriteria(SearchCriteria.contains(key, value));
    }

    public SpecificationBuilder<T> startsWith(String key, String value) {
        return addCriteria(new SearchCriteria(key, SearchOperation.STARTS_WITH, value));
    }

    public SpecificationBuilder<T> endsWith(String key, String value) {
        return addCriteria(new SearchCriteria(key, SearchOperation.ENDS_WITH, value));
    }

    public SpecificationBuilder<T> greaterThan(String key, Comparable<?> value) {
        return addCriteria(new SearchCriteria(key, SearchOperation.GREATER_THAN, value));
    }

    public SpecificationBuilder<T> greaterThanOrEqual(String key, Comparable<?> value) {
        return addCriteria(new SearchCriteria(key, SearchOperation.GREATER_THAN_OR_EQUAL, value));
    }

    public SpecificationBuilder<T> lessThan(String key, Comparable<?> value) {
        return addCriteria(new SearchCriteria(key, SearchOperation.LESS_THAN, value));
    }

    public SpecificationBuilder<T> lessThanOrEqual(String key, Comparable<?> value) {
        return addCriteria(new SearchCriteria(key, SearchOperation.LESS_THAN_OR_EQUAL, value));
    }

    public SpecificationBuilder<T> in(String key, Object... values) {
        params.add(SearchCriteria.in(key, values));
        return this;
    }

    public SpecificationBuilder<T> in(String key, List<?> values) {
        return addCriteria(new SearchCriteria(key, SearchOperation.IN, values));
    }

    public SpecificationBuilder<T> notIn(String key, Object... values) {
        return addCriteria(new SearchCriteria(key, SearchOperation.NOT_IN, Arrays.asList(values)));
    }

    public SpecificationBuilder<T> between(String key, Comparable<?> start, Comparable<?> end) {
        return addCriteria(SearchCriteria.between(key, start, end));
    }

    public SpecificationBuilder<T> isNull(String key) {
        return addCriteria(new SearchCriteria(key, SearchOperation.IS_NULL, null));
    }

    public SpecificationBuilder<T> isNotNull(String key) {
        return addCriteria(new SearchCriteria(key, SearchOperation.IS_NOT_NULL, null));
    }

    /**
     * Add OR predicate for the next condition
     */
    public SpecificationBuilder<T> or() {
        // Mark the next criteria as OR predicate
        return this;
    }

    /**
     * Adds a custom specification
     */
    public SpecificationBuilder<T> with(SearchSpecification<T> spec) {
        params.add(spec.getCriteria());
        return this;
    }

    /**
     * Adds a custom search criteria
     */
    public SpecificationBuilder<T> with(SearchCriteria criteria) {
        return addCriteria(criteria);
    }

    /**
     * Conditionally adds a criterion only if the condition is true
     */
    public SpecificationBuilder<T> when(boolean condition, Function<SpecificationBuilder<T>, SpecificationBuilder<T>> builderFunction) {
        if (condition) {
            return builderFunction.apply(this);
        }
        return this;
    }

    /**
     * Adds multiple criteria for the same field with OR logic
     */
    public SpecificationBuilder<T> orEqual(String key, Object... values) {
        for (int i = 0; i < values.length; i++) {
            SearchCriteria criteria = SearchCriteria.equal(key, values[i]);
            if (i > 0) {
                criteria.setOrPredicate(true);
            }
            addCriteria(criteria);
        }
        return this;
    }

    /**
     * Builds the final specification from all added criteria
     */
    public Specification<T> build() {
        if (params.isEmpty()) {
            return null;
        }

        // Filter out invalid criteria
        List<SearchCriteria> validParams = params.stream().filter(SearchCriteria::isValid).toList();

        if (validParams.isEmpty()) {
            log.warn("No valid search criteria found");
            return null;
        }

        Specification<T> result = new SearchSpecification<>(validParams.get(0));

        for (int i = 1; i < validParams.size(); i++) {
            SearchCriteria criteria = validParams.get(i);
            SearchSpecification<T> spec = new SearchSpecification<>(criteria);

            if (criteria.isOrPredicate()) {
                result = Specification.where(result).or(spec);
            } else {
                result = Specification.where(result).and(spec);
            }
        }

        return result;
    }

    /**
     * Returns the current number of criteria
     */
    public int size() {
        return params.size();
    }

    /**
     * Checks if the builder is empty
     */
    public boolean isEmpty() {
        return params.isEmpty();
    }

    /**
     * Clears all criteria
     */
    public SpecificationBuilder<T> clear() {
        params.clear();
        return this;
    }

    /**
     * Returns a copy of the current criteria list
     */
    public List<SearchCriteria> getCriteria() {
        return new ArrayList<>(params);
    }

    /**
     * Validates if a field is allowed for searching
     */
    private boolean isFieldAllowed(String fieldName) {
        if (allowedFields == null || allowedFields.isEmpty()) {
            return true; // No field restrictions
        }
        return fieldName != null && allowedFields.contains(fieldName);
    }

    /**
     * Helper method to validate field and add criteria
     */
    private SpecificationBuilder<T> addCriteria(SearchCriteria criteria) {
        if (!isFieldAllowed(criteria.getKey())) {
            log.warn("Field '{}' is not allowed for searching", criteria.getKey());
            throw new IllegalArgumentException("Field '" + criteria.getKey() + "' is not allowed for searching");
        }
        params.add(criteria);
        return this;
    }

    @Override
    public String toString() {
        return "SpecificationBuilder{" + "params=" + params + '}';
    }
}
