DELIMITER $$
CREATE PROCEDURE sp_update_request_status_if_ready(IN p_request_id INT)
BEGIN
  DECLARE total_events INT DEFAULT 0;
  DECLARE events_with_vendor INT DEFAULT 0;

  SELECT COUNT(*) INTO total_events
  FROM event
  WHERE request_id = p_request_id;

  SELECT COUNT(DISTINCT event_id) INTO events_with_vendor
  FROM allocation
  WHERE event_id IN (SELECT event_id FROM event WHERE request_id = p_request_id);

  IF total_events > 0 AND events_with_vendor = total_events THEN
    UPDATE event_request
    SET status = 'Scheduled'
    WHERE request_id = p_request_id;
  END IF;
END$$
DELIMITER ;