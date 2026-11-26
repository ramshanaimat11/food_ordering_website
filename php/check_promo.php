<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "db_connect.php";

$code = isset($_GET['code']) ? strtoupper(trim($_GET['code'])) : '';

if (empty($code)) {
    echo json_encode(["status" => "error", "message" => "Please enter a promo code."]);
    exit;
}

$stmt = $conn->prepare("SELECT code, discount_percent FROM promo_codes WHERE code = ?");
$stmt->bind_param("s", $code);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode([
        "status" => "success",
        "code" => $row['code'],
        "discount_percent" => (int)$row['discount_percent'],
        "message" => $row['discount_percent'] . "% discount applied!"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid promo code. Try HUB20 or SAVE10."
    ]);
}

$stmt->close();
$conn->close();
?>