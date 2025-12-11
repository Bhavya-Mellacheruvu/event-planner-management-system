DELIMITER $$

CREATE PROCEDURE sp_update_user(
    IN uid INT,
    IN uname VARCHAR(100),
    IN uemail VARCHAR(100),
    IN upassword VARCHAR(255),
    IN uphonenumber VARCHAR(20),
    IN upersonal TEXT,
    IN uexp VARCHAR(100),
    IN uspec VARCHAR(100)
)
BEGIN
    DECLARE userRole VARCHAR(20);

    -- 1. Get the user's role
    SELECT role INTO userRole 
    FROM users 
    WHERE user_id = uid;

    -- 2. Update USERS table
    UPDATE users 
    SET 
        name  = COALESCE(uname, name),
        email = COALESCE(uemail, email),
        password = COALESCE(upassword, password),
        phone_number = COALESCE(uphonenumber, phone_number)
    WHERE user_id = uid;

    -- 3. Update CLIENT table (if user is client)
    IF userRole = 'client' THEN
        UPDATE client
        SET personal_details = COALESCE(upersonal, personal_details)
        WHERE client_id = uid;
    END IF;

    -- 4. Update MANAGER table (if user is manager)
    IF userRole = 'manager' THEN
        UPDATE event_manager
        SET 
            experience = COALESCE(uexp, experience),
            specialization = COALESCE(uspec, specialization)
        WHERE manager_id = uid;
    END IF;

END$$

DELIMITER ;
