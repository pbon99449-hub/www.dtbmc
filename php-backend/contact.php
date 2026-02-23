<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$name = trim(substr((string)($data['name'] ?? ''), 0, 120));
$email = trim(substr((string)($data['email'] ?? ''), 0, 180));
$phone = trim(substr((string)($data['phone'] ?? ''), 0, 40));
$message = trim(substr((string)($data['message'] ?? ''), 0, 2500));

if ($name === '' || $message === '' || ($email === '' && $phone === '')) {
    http_response_code(400);
    echo json_encode(['message' => 'Name, message, and at least one contact are required.']);
    exit;
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid email address.']);
    exit;
}

$notifyEmail = getenv('CONTACT_NOTIFY_EMAIL');
$twilioSid = getenv('TWILIO_ACCOUNT_SID');
$twilioToken = getenv('TWILIO_AUTH_TOKEN');
$twilioFrom = getenv('TWILIO_FROM_NUMBER');
$twilioTo = getenv('TWILIO_TO_NUMBER');

$text = "New contact message\n"
      . "Name: {$name}\n"
      . "Email: " . ($email !== '' ? $email : '-') . "\n"
      . "Phone: " . ($phone !== '' ? $phone : '-') . "\n"
      . "Message:\n{$message}";

$emailSent = false;
$smsSent = false;
$errors = [];

if ($notifyEmail) {
    $subject = "New website contact from {$name}";
    $headers = "From: no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\n";
    if ($email !== '') {
        $headers .= "Reply-To: {$email}\r\n";
    }
    $emailSent = @mail($notifyEmail, $subject, $text, $headers);
    if (!$emailSent) {
        $errors[] = 'Email send failed';
    }
} else {
    $errors[] = 'CONTACT_NOTIFY_EMAIL not configured';
}

if ($twilioSid && $twilioToken && $twilioFrom && $twilioTo) {
    $smsText = substr(
        "New contact from {$name}. Email: " . ($email ?: '-') . ", Phone: " . ($phone ?: '-') . ". Msg: {$message}",
        0,
        1500
    );

    $url = "https://api.twilio.com/2010-04-01/Accounts/{$twilioSid}/Messages.json";
    $postFields = http_build_query([
        'From' => $twilioFrom,
        'To' => $twilioTo,
        'Body' => $smsText,
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD => "{$twilioSid}:{$twilioToken}",
        CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    ]);

    $response = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        $smsSent = true;
    } else {
        $errors[] = "Twilio send failed: HTTP {$httpCode} {$response}";
    }
} else {
    $errors[] = 'Twilio env vars not configured';
}

if (!$emailSent && !$smsSent) {
    http_response_code(502);
    echo json_encode([
        'message' => 'Message received but delivery failed.',
        'errors' => $errors,
    ]);
    exit;
}

echo json_encode([
    'message' => 'Message sent successfully.',
    'delivery' => [
        'email' => $emailSent ? 'sent' : 'failed_or_not_configured',
        'sms' => $smsSent ? 'sent' : 'failed_or_not_configured',
    ],
    'errors' => $errors,
]);
