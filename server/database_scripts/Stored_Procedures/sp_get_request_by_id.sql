DELIMITER $$

CREATE PROCEDURE sp_get_request_by_id( IN p_request_id INT)
BEGIN
    SELECT 
    er.request_id,
        er.event_request_name,
        er.event_request_desc,
        er.city,
        er.theme_pref,
        er.overall_budget,
        er.client_id,
        er.request_id,
        er.event_start_date,
        er.created_at,
        er.request_type_id,
        er.guest_count,
        er.manager_id,
        er.notes,
        er.status
    FROM event_request er
    WHERE request_id = p_request_id;
END $$
DELIMITER ;