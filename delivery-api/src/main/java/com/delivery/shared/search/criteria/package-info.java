/**
 * Search criteria and parsing components for the enhanced search framework.
 *
 * This package contains the core criteria classes and parsing logic for building
 * dynamic search queries. It supports both programmatic criteria building and
 * string-based query parsing.
 *
 * Key classes:
 * - {@link SearchOperation} - Enumeration of all supported search operations
 * - {@link SearchCriteria} - Main criteria class with validation and utility methods
 * - {@link SpecSearchCriteria} - Specialized criteria for parser output
 * - {@link CriteriaParser} - Advanced parser with support for complex expressions
 *
 * Supported operations:
 * - Equality/Inequality: :, !
 * - Comparisons: >, >=, <, <=
 * - Pattern matching: ~, contains, starts with, ends with
 * - Set operations: in, not in
 * - Null checks: null, !null
 * - Range operations: between
 *
 * @version 2.0
 * @since 1.0
 */
package com.delivery.shared.search.criteria;
