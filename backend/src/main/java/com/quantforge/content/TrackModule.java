package com.quantforge.content;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "track_modules")
public class TrackModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Track track;

    @Column(nullable = false)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private int sortOrder;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder")
    private List<ModuleItem> items = new ArrayList<>();

    protected TrackModule() {
    }

    public TrackModule(Track track, String slug, String title, String description, int sortOrder) {
        this.track = track;
        this.slug = slug;
        this.title = title;
        this.description = description;
        this.sortOrder = sortOrder;
    }

    public Long getId() {
        return id;
    }

    public Track getTrack() {
        return track;
    }

    public String getSlug() {
        return slug;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public List<ModuleItem> getItems() {
        return items;
    }
}
