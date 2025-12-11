DELIMITER $$

CREATE PROCEDURE sp_get_requests_by_client(IN p_client_id INT)
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
        er.request_type,
        er.guest_count,
        er.manager_id,
        er.notes,
        er.status,
        u.name AS manager_name
    FROM event_request er
    LEFT JOIN users u ON er.manager_id = u.user_id 
    JOIN request_type r ON r.request_type_id = er.request_type_id
    WHERE er.client_id = p_client_id;
END $$

DELIMITER ;