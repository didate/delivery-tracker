package com.delivery.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.delivery.domain.RoundCustomer} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RoundCustomerDTO implements Serializable {

    private Long id;

    @NotNull
    private Integer sequenceOrder;

    private Boolean visited;

    private Instant visitTime;

    @Lob
    private String notes;

    @NotNull
    private RoundDTO round;

    @NotNull
    private CustomerDTO customer;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getSequenceOrder() {
        return sequenceOrder;
    }

    public void setSequenceOrder(Integer sequenceOrder) {
        this.sequenceOrder = sequenceOrder;
    }

    public Boolean getVisited() {
        return visited;
    }

    public void setVisited(Boolean visited) {
        this.visited = visited;
    }

    public Instant getVisitTime() {
        return visitTime;
    }

    public void setVisitTime(Instant visitTime) {
        this.visitTime = visitTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public RoundDTO getRound() {
        return round;
    }

    public void setRound(RoundDTO round) {
        this.round = round;
    }

    public CustomerDTO getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerDTO customer) {
        this.customer = customer;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof RoundCustomerDTO)) {
            return false;
        }

        RoundCustomerDTO roundCustomerDTO = (RoundCustomerDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, roundCustomerDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RoundCustomerDTO{" +
            "id=" + getId() +
            ", sequenceOrder=" + getSequenceOrder() +
            ", visited='" + getVisited() + "'" +
            ", visitTime='" + getVisitTime() + "'" +
            ", notes='" + getNotes() + "'" +
            ", round=" + getRound() +
            ", customer=" + getCustomer() +
            "}";
    }
}
