DELIMITER $$
CREATE PROCEDURE sp_get_vendors()
BEGIN
  SELECT vendor_id, vendor_name, service, contact_info, created_at
  FROM vendor
  ORDER BY vendor_name;
END $$
DELIMITER ;
