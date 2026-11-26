<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "db_connect.php";

$sql = "SELECT item_id AS id, name, category, price, rating, prep_time AS prepTime, badge, description, image_url AS image FROM menu_items";
$result = $conn->query($sql);

$menu = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $row['price'] = (int)$row['price'];
        $row['rating'] = (float)$row['rating'];
        $menu[] = $row;
    }
}

echo json_encode([
    "status" => "success",
    "items" => $menu
]);

$conn->close();
?>