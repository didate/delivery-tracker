package com.delivery.delivery.domain.service;

import com.delivery.catalog.domain.entity.Product;
import com.delivery.catalog.domain.repository.ProductRepository;
import com.delivery.customer.domain.entity.Customer;
import com.delivery.customer.domain.repository.CustomerRepository;
import com.delivery.delivery.application.dto.CreateDeliveryItemRequest;
import com.delivery.delivery.domain.entity.Delivery;
import com.delivery.delivery.domain.entity.DeliveryItem;
import com.delivery.delivery.domain.entity.DeliveryStatus;
import com.delivery.delivery.domain.repository.DeliveryItemRepository;
import com.delivery.delivery.domain.repository.DeliveryRepository;
import com.delivery.driver.domain.entity.Driver;
import com.delivery.driver.domain.repository.DriverRepository;
import com.delivery.shared.exception.ResourceNotFoundException;
import com.delivery.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DeliveryItemRepository deliveryItemRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Delivery createDelivery(UUID customerId, UUID driverId, LocalDate deliveryDate,
                                   List<CreateDeliveryItemRequest> items, String notes) {
        UUID tenantId = TenantContext.getCurrentTenant();

        // Validate customer exists
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));

        // Validate driver exists
        Driver driver = driverRepository.findByIdAndTenantId(driverId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));

        // Create delivery
        Delivery delivery = Delivery.builder()
                .customerId(customerId)
                .driverId(driverId)
                .deliveryDate(deliveryDate)
                .status(DeliveryStatus.PENDING)
                .notes(notes)
                .totalAmount(BigDecimal.ZERO)
                .paidAmount(BigDecimal.ZERO)
                .build();

        delivery = deliveryRepository.save(delivery);

        // Create delivery items
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CreateDeliveryItemRequest itemRequest : items) {
            // Validate product exists
            Product product = productRepository.findByIdAndTenantId(itemRequest.getProductId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemRequest.getProductId()));

            BigDecimal itemTotal = itemRequest.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            DeliveryItem item = DeliveryItem.builder()
                    .deliveryId(delivery.getId())
                    .productId(itemRequest.getProductId())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemRequest.getUnitPrice())
                    .totalPrice(itemTotal)
                    .build();

            deliveryItemRepository.save(item);
            totalAmount = totalAmount.add(itemTotal);
        }

        // Update delivery total
        delivery.setTotalAmount(totalAmount);
        return deliveryRepository.save(delivery);
    }

    @Transactional
    public Delivery updateDeliveryStatus(UUID id, DeliveryStatus status) {
        Delivery delivery = getById(id);
        delivery.setStatus(status);
        return deliveryRepository.save(delivery);
    }

    @Transactional
    public DeliveryItem addDeliveryItem(UUID deliveryId, UUID productId, Integer quantity, BigDecimal unitPrice) {
        UUID tenantId = TenantContext.getCurrentTenant();

        Delivery delivery = getById(deliveryId);

        // Validate product exists
        Product product = productRepository.findByIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

        DeliveryItem item = DeliveryItem.builder()
                .deliveryId(deliveryId)
                .productId(productId)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .totalPrice(itemTotal)
                .build();

        item = deliveryItemRepository.save(item);

        // Recalculate delivery total
        calculateAndUpdateDeliveryTotal(delivery);

        return item;
    }

    @Transactional
    public void removeDeliveryItem(UUID deliveryId, UUID itemId) {
        Delivery delivery = getById(deliveryId);

        DeliveryItem item = deliveryItemRepository.findByIdAndDeliveryId(itemId, deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryItem", "id", itemId));

        deliveryItemRepository.delete(item);

        // Recalculate delivery total
        calculateAndUpdateDeliveryTotal(delivery);
    }

    public Delivery getById(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return deliveryRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", id));
    }

    public Page<Delivery> listByTenant(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return deliveryRepository.findByTenantId(tenantId, pageable);
    }

    public Page<Delivery> listByCustomer(UUID customerId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return deliveryRepository.findByTenantIdAndCustomerId(tenantId, customerId, pageable);
    }

    public Page<Delivery> listByDriver(UUID driverId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return deliveryRepository.findByTenantIdAndDriverId(tenantId, driverId, pageable);
    }

    public Page<Delivery> listByDate(LocalDate date, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return deliveryRepository.findByTenantIdAndDeliveryDate(tenantId, date, pageable);
    }

    public Page<Delivery> listByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return deliveryRepository.findByTenantIdAndDeliveryDateBetween(tenantId, startDate, endDate, pageable);
    }

    public Page<Delivery> listByStatus(DeliveryStatus status, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return deliveryRepository.findByTenantIdAndStatus(tenantId, status, pageable);
    }

    public Page<Delivery> listByDriverAndStatus(UUID driverId, DeliveryStatus status, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return deliveryRepository.findByTenantIdAndDriverIdAndStatus(tenantId, driverId, status, pageable);
    }

    public Page<Delivery> listByCustomerAndStatus(UUID customerId, DeliveryStatus status, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return deliveryRepository.findByTenantIdAndCustomerIdAndStatus(tenantId, customerId, status, pageable);
    }

    public Page<Delivery> listByCustomerAndDateRange(UUID customerId, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return deliveryRepository.findByTenantIdAndCustomerIdAndDeliveryDateBetween(tenantId, customerId, startDate, endDate, pageable);
    }

    public Page<Delivery> listByDriverAndDateRange(UUID driverId, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return deliveryRepository.findByTenantIdAndDriverIdAndDeliveryDateBetween(tenantId, driverId, startDate, endDate, pageable);
    }

    public List<DeliveryItem> getDeliveryItems(UUID deliveryId) {
        // Verify delivery exists and belongs to tenant
        getById(deliveryId);
        return deliveryItemRepository.findByDeliveryId(deliveryId);
    }

    public BigDecimal calculateDeliveryTotal(UUID deliveryId) {
        List<DeliveryItem> items = getDeliveryItems(deliveryId);
        return items.stream()
                .map(DeliveryItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void calculateAndUpdateDeliveryTotal(Delivery delivery) {
        List<DeliveryItem> items = deliveryItemRepository.findByDeliveryId(delivery.getId());
        BigDecimal totalAmount = items.stream()
                .map(DeliveryItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        delivery.setTotalAmount(totalAmount);
        deliveryRepository.save(delivery);
    }
}
