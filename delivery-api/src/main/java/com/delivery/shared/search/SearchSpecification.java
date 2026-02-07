package com.delivery.shared.search;

import com.delivery.shared.search.criteria.SearchCriteria;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.domain.Specification;

/**
 * Enhanced JPA Specification for dynamic query building with improved type handling,
 * error handling, and support for modern JPA features.
 */
public class SearchSpecification<T> implements Specification<T> {

    private static final long serialVersionUID = 1L;
    private final Logger log = LoggerFactory.getLogger(SearchSpecification.class);

    private final SearchCriteria criteria;

    public SearchSpecification(SearchCriteria criteria) {
        this.criteria = criteria;
    }

    @Override
    public Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder builder) {
        if (!criteria.isValid()) {
            log.warn("Invalid search criteria: {}", criteria);
            return builder.conjunction(); // Return true predicate for invalid criteria
        }

        try {
            return buildPredicate(root, builder);
        } catch (Exception e) {
            log.error("Error building predicate for criteria: {}", criteria, e);
            return builder.conjunction(); // Return true predicate on error
        }
    }

    private Predicate buildPredicate(Root<T> root, CriteriaBuilder builder) {
        Path<?> path = getPath(root, criteria.getKey());
        Class<?> fieldType = path.getJavaType();

        switch (criteria.getOperation()) {
            case EQUALITY:
                return buildEqualityPredicate(builder, path, fieldType);
            case NEGATION:
                return buildNegationPredicate(builder, path, fieldType);
            case GREATER_THAN:
                return buildComparisonPredicate(builder, path, fieldType, ">", false);
            case GREATER_THAN_OR_EQUAL:
                return buildComparisonPredicate(builder, path, fieldType, ">", true);
            case LESS_THAN:
                return buildComparisonPredicate(builder, path, fieldType, "<", false);
            case LESS_THAN_OR_EQUAL:
                return buildComparisonPredicate(builder, path, fieldType, "<", true);
            case LIKE:
                return buildLikePredicate(builder, path);
            case STARTS_WITH:
                return buildPatternPredicate(builder, path, criteria.getValueAsString() + "%");
            case ENDS_WITH:
                return buildPatternPredicate(builder, path, "%" + criteria.getValueAsString());
            case CONTAINS:
                return buildPatternPredicate(builder, path, "%" + criteria.getValueAsString() + "%");
            case IN:
                return buildInPredicate(builder, path, fieldType);
            case NOT_IN:
                return buildNotInPredicate(builder, path, fieldType);
            case IS_NULL:
                return builder.isNull(path);
            case IS_NOT_NULL:
                return builder.isNotNull(path);
            case BETWEEN:
                return buildBetweenPredicate(builder, path, fieldType);
            default:
                log.warn("Unsupported operation: {}", criteria.getOperation());
                return builder.conjunction();
        }
    }

    /**
     * Gets the path for nested properties (e.g., "direction.id" -> root.get("direction").get("id"))
     * Supports nested entity relationships and handles path traversal safely
     */
    private Path<?> getPath(Root<T> root, String key) {
        try {
            String[] parts = key.split("\\.");
            Path<?> path = root.get(parts[0]);

            for (int i = 1; i < parts.length; i++) {
                path = path.get(parts[i]);
            }
            return path;
        } catch (IllegalArgumentException e) {
            log.error("Error creating path for key '{}': {}", key, e.getMessage());
            throw new IllegalArgumentException("Invalid field path: " + key, e);
        }
    }

    @SuppressWarnings("unchecked")
    private Predicate buildEqualityPredicate(CriteriaBuilder builder, Path<?> path, Class<?> fieldType) {
        Object convertedValue = convertValue(criteria.getValue(), fieldType);

        if (fieldType == String.class && !criteria.isCaseSensitive()) {
            return builder.equal(builder.lower((Expression<String>) path), convertedValue.toString().toLowerCase());
        }
        return builder.equal(path, convertedValue);
    }

    @SuppressWarnings("unchecked")
    private Predicate buildNegationPredicate(CriteriaBuilder builder, Path<?> path, Class<?> fieldType) {
        Object convertedValue = convertValue(criteria.getValue(), fieldType);

        if (fieldType == String.class && !criteria.isCaseSensitive()) {
            return builder.notEqual(builder.lower((Expression<String>) path), convertedValue.toString().toLowerCase());
        }
        return builder.notEqual(path, convertedValue);
    }

    @SuppressWarnings("unchecked")
    private Predicate buildComparisonPredicate(CriteriaBuilder builder, Path<?> path, Class<?> fieldType, String op, boolean orEqual) {
        Object convertedValue = convertValue(criteria.getValue(), fieldType);

        if (Comparable.class.isAssignableFrom(fieldType)) {
            Expression<? extends Comparable> comparableExpr = (Expression<? extends Comparable>) path;
            Comparable<Object> comparableValue = (Comparable<Object>) convertedValue;

            switch (op) {
                case ">":
                    return orEqual
                        ? builder.greaterThanOrEqualTo(comparableExpr, comparableValue)
                        : builder.greaterThan(comparableExpr, comparableValue);
                case "<":
                    return orEqual
                        ? builder.lessThanOrEqualTo(comparableExpr, comparableValue)
                        : builder.lessThan(comparableExpr, comparableValue);
                default:
                    return builder.conjunction();
            }
        }
        log.warn("Comparison operation not supported for non-Comparable type: {}", fieldType);
        return builder.conjunction();
    }

    @SuppressWarnings("unchecked")
    private Predicate buildLikePredicate(CriteriaBuilder builder, Path<?> path) {
        if (path.getJavaType() != String.class) {
            log.warn("LIKE operation can only be applied to String fields, got: {}", path.getJavaType());
            return builder.conjunction();
        }

        Expression<String> stringPath = (Expression<String>) path;
        String pattern = criteria.getValueAsString();

        if (!criteria.isCaseSensitive()) {
            return builder.like(builder.lower(stringPath), pattern.toLowerCase());
        }
        return builder.like(stringPath, pattern);
    }

    @SuppressWarnings("unchecked")
    private Predicate buildPatternPredicate(CriteriaBuilder builder, Path<?> path, String pattern) {
        if (path.getJavaType() != String.class) {
            log.warn("Pattern operation can only be applied to String fields, got: {}", path.getJavaType());
            return builder.conjunction();
        }

        Expression<String> stringPath = (Expression<String>) path;

        if (!criteria.isCaseSensitive()) {
            return builder.like(builder.lower(stringPath), pattern.toLowerCase());
        }
        return builder.like(stringPath, pattern);
    }

    private Predicate buildInPredicate(CriteriaBuilder builder, Path<?> path, Class<?> fieldType) {
        List<Object> values = criteria.getValueAsList();
        List<Object> convertedValues = values.stream().map(v -> convertValue(v, fieldType)).toList();

        return path.in(convertedValues);
    }

    private Predicate buildNotInPredicate(CriteriaBuilder builder, Path<?> path, Class<?> fieldType) {
        return builder.not(buildInPredicate(builder, path, fieldType));
    }

    @SuppressWarnings("unchecked")
    private Predicate buildBetweenPredicate(CriteriaBuilder builder, Path<?> path, Class<?> fieldType) {
        List<Object> values = criteria.getValueAsList();
        if (values.size() != 2) {
            log.warn("BETWEEN operation requires exactly 2 values, got: {}", values.size());
            return builder.conjunction();
        }

        if (!Comparable.class.isAssignableFrom(fieldType)) {
            log.warn("BETWEEN operation can only be applied to Comparable fields, got: {}", fieldType);
            return builder.conjunction();
        }

        Object start = convertValue(values.get(0), fieldType);
        Object end = convertValue(values.get(1), fieldType);

        Expression<? extends Comparable> comparableExpr = (Expression<? extends Comparable>) path;
        return builder.between(comparableExpr, (Comparable) start, (Comparable) end);
    }

    /**
     * Enhanced value conversion with support for more types and better error handling
     */
    private Object convertValue(Object value, Class<?> targetType) {
        if (value == null) {
            return null;
        }

        if (targetType.isInstance(value)) {
            return value;
        }

        String stringValue = value.toString();

        try {
            // Primitive and wrapper types
            if (targetType == String.class) {
                return stringValue;
            } else if (targetType == Boolean.class || targetType == boolean.class) {
                return Boolean.parseBoolean(stringValue);
            } else if (targetType == Integer.class || targetType == int.class) {
                return Integer.parseInt(stringValue);
            } else if (targetType == Long.class || targetType == long.class) {
                return Long.parseLong(stringValue);
            } else if (targetType == Double.class || targetType == double.class) {
                return Double.parseDouble(stringValue);
            } else if (targetType == Float.class || targetType == float.class) {
                return Float.parseFloat(stringValue);
            } else if (targetType == BigDecimal.class) {
                return new BigDecimal(stringValue);
            }
            // Date/Time types
            else if (targetType == Instant.class) {
                // Try parsing as timestamp first, then as ISO instant, then as date-only
                try {
                    return Instant.ofEpochMilli(Long.parseLong(stringValue));
                } catch (NumberFormatException e) {
                    try {
                        return Instant.parse(stringValue);
                    } catch (DateTimeParseException e2) {
                        // Try parsing as date-only (YYYY-MM-DD) and convert to start of day UTC
                        try {
                            LocalDate date = LocalDate.parse(stringValue);
                            return date.atStartOfDay(ZoneOffset.UTC).toInstant();
                        } catch (DateTimeParseException e3) {
                            throw new IllegalArgumentException(
                                "Cannot parse date value: " +
                                stringValue +
                                ". Expected formats: ISO instant (2025-12-01T00:00:00Z), epoch millis, or date (2025-12-01)",
                                e3
                            );
                        }
                    }
                }
            } else if (targetType == LocalDate.class) {
                return LocalDate.parse(stringValue);
            } else if (targetType == LocalDateTime.class) {
                return LocalDateTime.parse(stringValue);
            }
            // Enum types
            else if (targetType.isEnum()) {
                return parseEnumValue(stringValue, targetType);
            }
            // Default fallback
            else {
                log.warn("Unsupported type conversion from {} to {}", value.getClass(), targetType);
                return value;
            }
        } catch (Exception e) {
            log.error("Error converting value '{}' to type {}: {}", stringValue, targetType, e.getMessage());
            return value; // Return original value as fallback
        }
    }

    /**
     * Enhanced enum parsing with support for case-insensitive matching
     */
    @SuppressWarnings({ "unchecked", "rawtypes" })
    private Object parseEnumValue(String stringValue, Class<?> enumType) {
        try {
            // Try exact match first
            return Enum.valueOf((Class<Enum>) enumType, stringValue);
        } catch (IllegalArgumentException e) {
            // Try case-insensitive match
            for (Object enumConstant : enumType.getEnumConstants()) {
                if (enumConstant.toString().equalsIgnoreCase(stringValue)) {
                    return enumConstant;
                }
            }
            log.warn("Cannot parse enum value '{}' for type {}", stringValue, enumType);
            throw e;
        }
    }

    public SearchCriteria getCriteria() {
        return criteria;
    }
}
