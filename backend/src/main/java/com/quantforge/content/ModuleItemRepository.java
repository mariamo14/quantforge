package com.quantforge.content;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ModuleItemRepository extends JpaRepository<ModuleItem, Long> {

    Optional<ModuleItem> findFirstByLessonSlug(String slug);

    Optional<ModuleItem> findFirstByProblemSlug(String slug);

    Optional<ModuleItem> findFirstByQuizSlug(String slug);
}
