DELIMITER $$

CREATE PROCEDURE sp_get_user_by_email(IN p_email VARCHAR(150))
BEGIN
    SELECT user_id, email, password, phone_number, role, name
    FROM users
    WHERE email = p_email;
END $$

DELIMITER ;