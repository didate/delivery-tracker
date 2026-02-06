package com.delivery.returns.domain.service;

import com.delivery.returns.domain.entity.ProductReturn;
import com.delivery.returns.domain.entity.ReturnItem;
import com.delivery.returns.domain.entity.ReturnReason;
import com.delivery.returns.domain.repository.ProductReturnRepository;
import com.delivery.returns.domain.repository.ReturnItemRepository;
import com.delivery.shared.exception.ResourceNotFoundException;
import com.delivery.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductReturnService {

    private final ProductReturnRepository productReturnRepository;
    private final ReturnItemRepository returnItemRepository;

    @Transactional
    public ProductReturn createReturn(UUID customerId, UUID driverId, LocalDate returnDate,
                                       List<ReturnItem> items, String notes) {
        ProductReturn productReturn = ProductReturn.builder()
                .customerId(customerId)
                .driverId(driverId)
                .returnDate(returnDate)
                .notes(notes)
                .items(new ArrayList<>())
                .build();

        ProductReturn savedReturn = productReturnRepository.save(productReturn);

        if (items != null && !items.isEmpty()) {
            for (ReturnItem item : items) {
                item.setReturnId(savedReturn.getId());
                item.setTenantId(savedReturn.getTenantId());
                returnItemRepository.save(item);
            }
        }

        return getById(savedReturn.getId());
    }

    @Transactional
    public ReturnItem addReturnItem(UUID returnId, UUID productId, Integer quantity,
                                     ReturnReason reason, BigDecimal unitValue) {
        ProductReturn productReturn = getById(returnId);

        ReturnItem item = ReturnItem.builder()
                .returnId(returnId)
                .productId(productId)
                .quantity(quantity)
                .reason(reason)
                .unitValue(unitValue)
                .build();
        item.setTenantId(productReturn.getTenantId());

        return returnItemRepository.save(item);
    }

    @Transactional
    public void removeReturnItem(UUID returnId, UUID itemId) {
        ProductReturn productReturn = getById(returnId);

        ReturnItem item = returnItemRepository.findByIdAndReturnId(itemId, returnId)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnItem", "id", itemId));

        returnItemRepository.delete(item);
    }

    public ProductReturn getById(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productReturnRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductReturn", "id", id));
    }

    public Page<ProductReturn> listByCustomer(UUID customerId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productReturnRepository.findByTenantIdAndCustomerId(tenantId, customerId, pageable);
    }

    public Page<ProductReturn> listByDriver(UUID driverId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productReturnRepository.findByTenantIdAndDriverId(tenantId, driverId, pageable);
    }

    public Page<ProductReturn> listByDate(LocalDate date, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productReturnRepository.findByTenantIdAndReturnDate(tenantId, date, pageable);
    }

    public Page<ProductReturn> listByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productReturnRepository.findByTenantIdAndReturnDateBetween(tenantId, startDate, endDate, pageable);
    }

    public Page<ProductReturn> listByTenant(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return productReturnRepository.findByTenantId(tenantId, pageable);
    }

    public Page<ProductReturn> listWithFilters(UUID customerId, UUID driverId, LocalDate date,
                                                LocalDate startDate, LocalDate endDate, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();

        if (customerId != null && startDate != null && endDate != null) {
            return productReturnRepository.findByTenantIdAndCustomerIdAndReturnDateBetween(
                    tenantId, customerId, startDate, endDate, pageable);
        }

        if (driverId != null && startDate != null && endDate != null) {
            return productReturnRepository.findByTenantIdAndDriverIdAndReturnDateBetween(
                    tenantId, driverId, startDate, endDate, pageable);
        }

        if (customerId != null) {
            return productReturnRepository.findByTenantIdAndCustomerId(tenantId, customerId, pageable);
        }

        if (driverId != null) {
            return productReturnRepository.findByTenantIdAndDriverId(tenantId, driverId, pageable);
        }

        if (date != null) {
            return productReturnRepository.findByTenantIdAndReturnDate(tenantId, date, pageable);
        }

        if (startDate != null && endDate != null) {
            return productReturnRepository.findByTenantIdAndReturnDateBetween(tenantId, startDate, endDate, pageable);
        }

        return productReturnRepository.findByTenantId(tenantId, pageable);
    }

    public List<ReturnItem> getItemsByReturnId(UUID returnId) {
        getById(returnId); // Verify access
        return returnItemRepository.findByReturnId(returnId);
    }

    /**
     * Calculate total returns aggregated by product.
     * Returns a map of productId to total quantity returned.
     */
    public Map<UUID, Integer> calculateTotalReturns() {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<ProductReturn> returns = productReturnRepository.findByTenantId(tenantId);

        Map<UUID, Integer> totals = new HashMap<>();
        for (ProductReturn productReturn : returns) {
            List<ReturnItem> items = returnItemRepository.findByReturnId(productReturn.getId());
            for (ReturnItem item : items) {
                totals.merge(item.getProductId(), item.getQuantity(), Integer::sum);
            }
        }
        return totals;
    }

    /**
     * Calculate total returns aggregated by product within a date range.
     */
    public Map<UUID, Integer> calculateTotalReturnsByDateRange(LocalDate startDate, LocalDate endDate) {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<ProductReturn> returns = productReturnRepository.findByTenantIdAndReturnDateBetween(
                tenantId, startDate, endDate);

        Map<UUID, Integer> totals = new HashMap<>();
        for (ProductReturn productReturn : returns) {
            List<ReturnItem> items = returnItemRepository.findByReturnId(productReturn.getId());
            for (ReturnItem item : items) {
                totals.merge(item.getProductId(), item.getQuantity(), Integer::sum);
            }
        }
        return totals;
    }

    /**
     * Calculate total deposit value from returns.
     */
    public BigDecimal calculateTotalDepositValue() {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<ProductReturn> returns = productReturnRepository.findByTenantId(tenantId);

        BigDecimal total = BigDecimal.ZERO;
        for (ProductReturn productReturn : returns) {
            List<ReturnItem> items = returnItemRepository.findByReturnId(productReturn.getId());
            for (ReturnItem item : items) {
                if (item.getUnitValue() != null) {
                    total = total.add(item.getUnitValue().multiply(BigDecimal.valueOf(item.getQuantity())));
                }
            }
        }
        return total;
    }

    /**
     * Calculate total deposit value from returns within a date range.
     */
    public BigDecimal calculateTotalDepositValueByDateRange(LocalDate startDate, LocalDate endDate) {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<ProductReturn> returns = productReturnRepository.findByTenantIdAndReturnDateBetween(
                tenantId, startDate, endDate);

        BigDecimal total = BigDecimal.ZERO;
        for (ProductReturn productReturn : returns) {
            List<ReturnItem> items = returnItemRepository.findByReturnId(productReturn.getId());
            for (ReturnItem item : items) {
                if (item.getUnitValue() != null) {
                    total = total.add(item.getUnitValue().multiply(BigDecimal.valueOf(item.getQuantity())));
                }
            }
        }
        return total;
    }

    /**
     * Get returns count by reason.
     */
    public Map<ReturnReason, Long> countByReason() {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<ProductReturn> returns = productReturnRepository.findByTenantId(tenantId);

        Map<ReturnReason, Long> counts = new HashMap<>();
        for (ReturnReason reason : ReturnReason.values()) {
            counts.put(reason, 0L);
        }

        for (ProductReturn productReturn : returns) {
            List<ReturnItem> items = returnItemRepository.findByReturnId(productReturn.getId());
            for (ReturnItem item : items) {
                counts.merge(item.getReason(), 1L, Long::sum);
            }
        }
        return counts;
    }
}
