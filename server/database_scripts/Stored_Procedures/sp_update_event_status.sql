DELIMITER $$

CREATE PROCEDURE sp_update_event_status(
    IN p_request_id INT,
    IN p_status VARCHAR(50),
    IN p_manager_id INT
)
BEGIN
    UPDATE event_request
    SET status = p_status, manager_id = p_manager_id
    WHERE request_id = p_request_id;

    SELECT 'Status Updated' AS message;
END$$

DELIMITER ;
