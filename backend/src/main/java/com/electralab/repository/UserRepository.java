package com.electralab.repository;

import com.electralab.entity.Role;
import com.electralab.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRollNumberIgnoreCase(String rollNumber);

    long countByRole(Role role);

    List<User> findByRole(Role role);
}
