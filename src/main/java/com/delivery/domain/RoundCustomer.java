package com.delivery.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A RoundCustomer.
 */
@Entity
@Table(name = "round_customer")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RoundCustomer implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    @Column(name = "visited")
    private Boolean visited;

    @Column(name = "visit_time")
    private Instant visitTime;

    @Lob
    @Column(name = "notes")
    private String notes;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "tenant", "driver" }, allowSetters = true)
    private Round round;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "tenant", "driver" }, allowSetters = true)
    private Customer customer;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public RoundCustomer id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getSequenceOrder() {
        return this.sequenceOrder;
    }

    public RoundCustomer sequenceOrder(Integer sequenceOrder) {
        this.setSequenceOrder(sequenceOrder);
        return this;
    }

    public void setSequenceOrder(Integer sequenceOrder) {
        this.sequenceOrder = sequenceOrder;
    }

    public Boolean getVisited() {
        return this.visited;
    }

    public RoundCustomer visited(Boolean visited) {
        this.setVisited(visited);
        return this;
    }

    public void setVisited(Boolean visited) {
        this.visited = visited;
    }

    public Instant getVisitTime() {
        return this.visitTime;
    }

    public RoundCustomer visitTime(Instant visitTime) {
        this.setVisitTime(visitTime);
        return this;
    }

    public void setVisitTime(Instant visitTime) {
        this.visitTime = visitTime;
    }

    public String getNotes() {
        return this.notes;
    }

    public RoundCustomer notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Round getRound() {
        return this.round;
    }

    public void setRound(Round round) {
        this.round = round;
    }

    public RoundCustomer round(Round round) {
        this.setRound(round);
        return this;
    }

    public Customer getCustomer() {
        return this.customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public RoundCustomer customer(Customer customer) {
        this.setCustomer(customer);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof RoundCustomer)) {
            return false;
        }
        return getId() != null && getId().equals(((RoundCustomer) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RoundCustomer{" +
            "id=" + getId() +
            ", sequenceOrder=" + getSequenceOrder() +
            ", visited='" + getVisited() + "'" +
            ", visitTime='" + getVisitTime() + "'" +
            ", notes='" + getNotes() + "'" +
            "}";
    }
}
