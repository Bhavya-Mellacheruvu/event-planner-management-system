DELIMITER $$

CREATE PROCEDURE sp_get_user_by_id(IN uid INT)
BEGIN
    DECLARE userRole VARCHAR(20);

    -- 1. Get basic user details
    SELECT user_id, name, email, phone_number, role
    INTO @id, @name, @email, @phone_number, userRole
    FROM users
    WHERE user_id = uid;

    -- 2. Return base user row
    SELECT 
        @id AS user_id,
        @name AS name,
        @email AS email,
        @phone_number AS phone_number,
        userRole AS role;

    -- 3. If client → return client table data
    IF userRole = 'client' THEN
        SELECT personal_details
        FROM client
        WHERE client_id = uid;
    END IF;

    -- 4. If manager → return manager table data
    IF userRole = 'manager' THEN
        SELECT experience, specialization
        FROM event_manager
        WHERE manager_id = uid;
    END IF;

END$$

DELIMITER ;
