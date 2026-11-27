<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "db_connect.php";

$category = isset($_GET['category']) ? trim($_GET['category']) : 'All';
$search   = isset($_GET['search']) ? trim($_GET['search']) : '';

$sql = "SELECT item_id AS id, name, category, price, rating, prep_time AS prepTime, badge, description, image_url AS image FROM menu_items WHERE 1=1";
$params = [];
$types  = "";

if ($category !== '' && strcasecmp($category, 'All') !== 0) {
    $sql .= " AND category = ?";
    $params[] = $category;
    $types .= "s";
}

if ($search !== '') {
    $sql .= " AND (name LIKE ? OR description LIKE ? OR category LIKE ?)";
    $like = "%" . $search . "%";
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $types .= "sss";
}

$stmt = $conn->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

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
    "count"  => count($menu),
    "items"  => $menu
]);

$stmt->close();
$conn->close();
?>