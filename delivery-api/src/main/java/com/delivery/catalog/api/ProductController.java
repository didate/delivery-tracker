package com.delivery.catalog.api;

import com.delivery.catalog.application.dto.*;
import com.delivery.catalog.application.mapper.ProductMapper;
import com.delivery.catalog.domain.entity.PriceHistory;
import com.delivery.catalog.domain.entity.Product;
import com.delivery.catalog.domain.service.ProductService;
import com.delivery.shared.security.CurrentUser;
import com.delivery.shared.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product", description = "Product catalog management APIs")
public class ProductController {

    private final ProductService productService;
    private final ProductMapper productMapper;

    @PostMapping
    @Operation(summary = "Create a new product")
    public ResponseEntity<ProductResponse> createProduct(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateProductRequest request) {

        Product product = productService.createProduct(
                request.getName(),
                request.getDescription(),
                request.getPrice()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productMapper.toResponse(product));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a product by ID")
    public ResponseEntity<ProductResponse> getProduct(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {

        Product product = productService.getProductById(id);
        return ResponseEntity.ok(productMapper.toResponse(product));
    }

    @GetMapping
    @Operation(summary = "List all products with pagination and optional active filter")
    public ResponseEntity<Page<ProductResponse>> listProducts(
            @CurrentUser UserPrincipal currentUser,
            @Parameter(description = "Filter by active status")
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Product> products = productService.listProducts(active, pageable);
        Page<ProductResponse> response = products.map(productMapper::toResponse);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a product")
    public ResponseEntity<ProductResponse> updateProduct(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request) {

        Product product = productService.updateProduct(
                id,
                request.getName(),
                request.getDescription(),
                request.getPrice()
        );

        return ResponseEntity.ok(productMapper.toResponse(product));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a product (soft delete)")
    public ResponseEntity<Void> deactivateProduct(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {

        productService.deactivateProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    @Operation(summary = "Activate a previously deactivated product")
    public ResponseEntity<ProductResponse> activateProduct(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {

        productService.activateProduct(id);
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(productMapper.toResponse(product));
    }

    @GetMapping("/{id}/price-history")
    @Operation(summary = "Get price history for a product")
    public ResponseEntity<List<PriceHistoryResponse>> getPriceHistory(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {

        List<PriceHistory> priceHistory = productService.getPriceHistory(id);
        return ResponseEntity.ok(productMapper.toPriceHistoryResponseList(priceHistory));
    }
}
