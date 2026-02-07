package com.delivery.shared.search;

import com.delivery.shared.search.criteria.CriteriaParser;
import com.delivery.shared.search.criteria.SearchCriteria;
import com.delivery.shared.search.criteria.SpecSearchCriteria;
import java.util.Deque;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

/**
 * Service for performing advanced search operations using JPA Specifications.
 * Provides high-level search functionality with error handling and logging.
 */
@Service
public class SearchService {

    private final Logger log = LoggerFactory.getLogger(SearchService.class);
    private final CriteriaParser criteriaParser;

    public SearchService() {
        this.criteriaParser = new CriteriaParser();
    }

    /**
     * Performs a search using a query string
     */
    public <T, R extends JpaRepository<T, ?> & JpaSpecificationExecutor<T>> Page<T> search(
        R repository,
        String searchQuery,
        Pageable pageable
    ) {
        try {
            Specification<T> specification = parseSearchQuery(searchQuery);
            if (specification != null) {
                return repository.findAll(specification, pageable);
            } else {
                return repository.findAll(pageable);
            }
        } catch (Exception e) {
            log.error("Error performing search with query: {}", searchQuery, e);
            return repository.findAll(pageable); // Fallback to all results
        }
    }

    /**
     * Performs a search using a query string with field validation
     */
    public <T, R extends JpaRepository<T, ?> & JpaSpecificationExecutor<T>> Page<T> search(
        R repository,
        String searchQuery,
        Pageable pageable,
        List<String> allowedFields
    ) {
        try {
            Specification<T> specification = parseSearchQuery(searchQuery, allowedFields);
            if (specification != null) {
                return repository.findAll(specification, pageable);
            } else {
                return repository.findAll(pageable);
            }
        } catch (Exception e) {
            log.error("Error performing search with query: {}", searchQuery, e);
            return repository.findAll(pageable);
        }
    }

    /**
     * Performs a search using a specification builder
     */
    public <T> Page<T> search(JpaSpecificationExecutor<T> repository, SpecificationBuilder<T> builder, Pageable pageable) {
        try {
            Specification<T> specification = builder.build();
            if (specification != null) {
                return repository.findAll(specification, pageable);
            } else {
                return repository.findAll((Specification<T>) null, pageable);
            }
        } catch (Exception e) {
            log.error("Error performing search with builder: {}", builder, e);
            return repository.findAll((Specification<T>) null, pageable); // Fallback to all results
        }
    }

    /**
     * Finds a single entity using search criteria
     */
    public <T> Optional<T> findOne(JpaSpecificationExecutor<T> repository, SpecificationBuilder<T> builder) {
        try {
            Specification<T> specification = builder.build();
            if (specification != null) {
                return repository.findOne(specification);
            }
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error finding single entity with builder: {}", builder, e);
            return Optional.empty();
        }
    }

    /**
     * Counts entities matching the search criteria
     */
    public <T> long count(JpaSpecificationExecutor<T> repository, SpecificationBuilder<T> builder) {
        try {
            Specification<T> specification = builder.build();
            if (specification != null) {
                return repository.count(specification);
            }
            return repository.count((Specification<T>) null);
        } catch (Exception e) {
            log.error("Error counting entities with builder: {}", builder, e);
            return 0;
        }
    }

    /**
     * Checks if any entity exists matching the search criteria
     */
    public <T> boolean exists(JpaSpecificationExecutor<T> repository, SpecificationBuilder<T> builder) {
        return count(repository, builder) > 0;
    }

    /**
     * Parses a search query string into a JPA Specification
     */
    public <T> Specification<T> parseSearchQuery(String searchQuery) {
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return null;
        }

        try {
            Deque<Object> parsedCriteria = criteriaParser.parse(searchQuery);

            if (parsedCriteria.isEmpty()) {
                log.warn("No valid criteria found in search query: {}", searchQuery);
                return null;
            }

            if (!criteriaParser.validateCriteria(parsedCriteria)) {
                log.warn("Invalid criteria structure in search query: {}", searchQuery);
                return null;
            }

            return buildSpecificationFromParsedCriteria(parsedCriteria);
        } catch (Exception e) {
            log.error("Error parsing search query: {}", searchQuery, e);
            return null;
        }
    }

    /**
     * Parses a search query string into a JPA Specification with field validation
     */
    public <T> Specification<T> parseSearchQuery(String searchQuery, List<String> allowedFields) {
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return null;
        }

        try {
            Deque<Object> parsedCriteria = criteriaParser.parse(searchQuery);

            if (parsedCriteria.isEmpty()) {
                log.warn("No valid criteria found in search query: {}", searchQuery);
                return null;
            }

            if (!criteriaParser.validateCriteria(parsedCriteria)) {
                log.warn("Invalid criteria structure in search query: {}", searchQuery);
                return null;
            }

            // Validate that all fields in the query are allowed
            if (!validateSearchFields(parsedCriteria, allowedFields)) {
                log.warn("Search query contains disallowed fields: {}", searchQuery);
                throw new IllegalArgumentException("Search query contains disallowed fields");
            }

            return buildSpecificationFromParsedCriteria(parsedCriteria);
        } catch (Exception e) {
            log.error("Error parsing search query: {}", searchQuery, e);
            throw e; // Re-throw to preserve validation errors
        }
    }

    /**
     * Builds a JPA Specification from parsed criteria using postfix evaluation
     */
    @SuppressWarnings("unchecked")
    private <T> Specification<T> buildSpecificationFromParsedCriteria(Deque<Object> parsedCriteria) {
        Deque<Specification<T>> specStack = new LinkedList<>();

        for (Object item : parsedCriteria) {
            if (item instanceof SpecSearchCriteria) {
                SpecSearchCriteria specCriteria = (SpecSearchCriteria) item;
                if (specCriteria.isValid()) {
                    SearchCriteria criteria = specCriteria.toSearchCriteria();
                    SearchSpecification<T> spec = new SearchSpecification<>(criteria);
                    specStack.push(spec);
                } else {
                    log.warn("Invalid SpecSearchCriteria skipped: {}", specCriteria);
                }
            } else if (item instanceof String) {
                String operator = (String) item;
                if (specStack.size() >= 2) {
                    Specification<T> right = specStack.pop();
                    Specification<T> left = specStack.pop();

                    Specification<T> combined;
                    if ("OR".equals(operator)) {
                        combined = Specification.where(left).or(right);
                    } else { // Default to AND
                        combined = Specification.where(left).and(right);
                    }
                    specStack.push(combined);
                } else {
                    log.warn("Insufficient operands for operator: {}", operator);
                }
            }
        }

        return specStack.isEmpty() ? null : specStack.pop();
    }

    /**
     * Validates that all fields in the search criteria are allowed
     */
    private boolean validateSearchFields(Deque<Object> parsedCriteria, List<String> allowedFields) {
        if (allowedFields == null || allowedFields.isEmpty()) {
            return true; // No field restrictions
        }

        for (Object item : parsedCriteria) {
            if (item instanceof SpecSearchCriteria) {
                SpecSearchCriteria specCriteria = (SpecSearchCriteria) item;
                String fieldName = specCriteria.getKey();

                if (fieldName != null && !allowedFields.contains(fieldName)) {
                    log.warn("Disallowed field in search query: {}", fieldName);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Creates a new specification builder
     */
    public <T> SpecificationBuilder<T> builder() {
        return new SpecificationBuilder<>();
    }

    /**
     * Creates a new specification builder with field validation
     */
    public <T> SpecificationBuilder<T> builder(List<String> allowedFields) {
        return new SpecificationBuilder<>(allowedFields);
    }

    /**
     * Creates a specification builder with an initial criterion
     */
    public <T> SpecificationBuilder<T> builder(SearchCriteria criteria) {
        return new SpecificationBuilder<T>().with(criteria);
    }

    /**
     * Validates a search query without executing it
     */
    public boolean validateSearchQuery(String searchQuery) {
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return true; // Empty queries are valid (will return all)
        }

        try {
            Deque<Object> parsedCriteria = criteriaParser.parse(searchQuery);
            return criteriaParser.validateCriteria(parsedCriteria);
        } catch (Exception e) {
            log.debug("Invalid search query: {}", searchQuery, e);
            return false;
        }
    }

    /**
     * Gets helpful information about search query syntax
     */
    public List<String> getSearchSyntaxHelp() {
        return List.of(
            "Basic syntax: field:value (equality)",
            "Comparison: field>value, field<value, field>=value, field<=value",
            "Pattern matching: field~pattern (like), field:*value* (contains)",
            "Negation: field!value (not equal)",
            "Lists: field in [value1,value2]",
            "Null checks: field null, field !null",
            "Ranges: field between [start,end]",
            "Logical operators: AND, OR",
            "Grouping: Use parentheses for complex expressions",
            "Wildcards: Use * for pattern matching (field:value* for starts with)"
        );
    }
}
