/**
 * Enhanced search specification framework for dynamic JPA queries.
 *
 * This package provides a powerful and flexible search framework that allows for:
 * - Dynamic query building using JPA Specification pattern
 * - Support for complex search operations and comparisons
 * - Type-safe criteria building with fluent API
 * - Advanced query parsing with proper operator precedence
 * - Comprehensive error handling and logging
 *
 * Key components:
 * - {@link com.delivery.shared.search.criteria.SearchOperation} - Enum of supported search operations
 * - {@link com.delivery.shared.search.criteria.SearchCriteria} - Individual search criterion with validation
 * - {@link com.delivery.shared.search.SearchSpecification} - JPA Specification implementation
 * - {@link com.delivery.shared.search.SpecificationBuilder} - Fluent API for building complex specifications
 * - {@link com.delivery.shared.search.criteria.CriteriaParser} - Parser for string-based search expressions
 * - {@link com.delivery.shared.search.SearchService} - High-level service for search operations
 *
 * Usage examples:
 *
 * <pre>
 * // Using the builder API
 * SpecificationBuilder<Client> builder = new SpecificationBuilder<Client>()
 *     .equal("nom", "Doe")
 *     .contains("email", "@example.com")
 *     .greaterThan("dateCreation", yesterday);
 *
 * Page<Client> results = searchService.search(clientRepository, builder, pageable);
 *
 * // Using query string
 * String query = "nom:Doe AND email~*@example.com* AND dateCreation>" + yesterday.toEpochMilli();
 * Page<Client> results = searchService.search(clientRepository, query, pageable);
 * </pre>
 *
 * @version 2.0
 * @since 1.0
 */
package com.delivery.shared.search;
