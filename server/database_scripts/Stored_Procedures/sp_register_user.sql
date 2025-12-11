DELIMITER $$

CREATE PROCEDURE sp_register_user(
    IN p_email VARCHAR(150),
    IN p_name VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_phone_number VARCHAR(20),
    IN p_role ENUM('client','manager'),
    IN p_personal_details VARCHAR(255),
    IN p_experience VARCHAR(255),
    IN p_specialization VARCHAR(255)
)
BEGIN
    DECLARE new_id INT;

    -- Insert into users
    INSERT INTO users (email, name, password, phone_number, role)
    VALUES (p_email, p_name, p_password, p_phone_number, p_role);

    SET new_id = LAST_INSERT_ID();

    -- If client → insert into Client
    IF p_role = 'client' THEN
        INSERT INTO client (client_id, personal_details)
        VALUES (new_id, p_personal_details);
    END IF;

    -- If manager → insert into Event_Manager
    IF p_role = 'manager' THEN
        INSERT INTO event_manager (manager_id, experience, specialization)
        VALUES (new_id, p_experience, p_specialization);
    END IF;

    -- Return user_id to backend
    SELECT new_id AS user_id;
END $$

DELIMITER ;
