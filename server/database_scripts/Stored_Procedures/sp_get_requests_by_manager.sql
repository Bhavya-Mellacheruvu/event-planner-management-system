DELIMITER $$
DROP PROCEDURE IF EXISTS sp_get_requests_by_manager;
CREATE PROCEDURE sp_get_requests_by_manager(IN p_manager_id INT)
BEGIN
    SELECT 
        er.*,
        u.name AS client_name
    FROM event_request er
    JOIN users u ON er.client_id = u.user_id
    WHERE er.manager_id = p_manager_id
    ORDER BY er.request_id DESC;
END $$

DELIMITER ;
