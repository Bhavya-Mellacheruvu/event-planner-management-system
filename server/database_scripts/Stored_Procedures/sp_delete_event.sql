DELIMITER $$

CREATE PROCEDURE sp_delete_event(IN p_event_id INT)
BEGIN
    -- delete allocations first because of FK
    DELETE FROM allocation WHERE event_id = p_event_id;

    -- delete event
    DELETE FROM event WHERE event_id = p_event_id;
END $$

DELIMITER ;
