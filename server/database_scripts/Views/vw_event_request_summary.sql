
CREATE OR REPLACE VIEW vw_event_request_summary AS
SELECT 
r.request_id, 
r.event_request_name,
r.event_request_desc,
u.name AS client_name, 
r.city, 
r.theme_pref, 
r.overall_budget, 
r.status, 
r.event_start_date, 
COUNT(e.event_id) AS total_events, 
COUNT(a.vendor_id) AS total_vendors_assigned 
FROM event_request r 
	LEFT JOIN users u ON r.client_id = u.user_id 
    LEFT JOIN event e ON e.request_id = r.request_id 
    LEFT JOIN allocation a ON a.event_id = e.event_id 
GROUP BY r.request_id;

SELECT * FROM vw_event_request_summary;

                    