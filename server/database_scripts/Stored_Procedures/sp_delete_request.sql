DELIMITER $$

CREATE PROCEDURE sp_delete_request(IN p_request_id INT)
BEGIN
    DELETE FROM event_request WHERE event_request_id = p_request_id ;
END $$
DELIMITER;
