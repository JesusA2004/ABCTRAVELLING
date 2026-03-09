<?php
header('Content-Type: application/json; charset=utf-8');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';

function response($ok, $message) {
    echo json_encode([
        'ok' => $ok,
        'message' => $message
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    response(false, 'Método no permitido.');
}

$correo_principal = trim($_POST['correo_principal'] ?? '');
$nombre_comercial = trim($_POST['nombre_comercial'] ?? '');
$owner_name = trim($_POST['owner_name'] ?? '');
$correo_empresa = trim($_POST['correo_empresa'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$mercados = trim($_POST['mercados'] ?? '');
$usuario_principal_nombre = trim($_POST['usuario_principal_nombre'] ?? '');
$usuario_principal_correo = trim($_POST['usuario_principal_correo'] ?? '');
$usuario_principal_telefono = trim($_POST['usuario_principal_telefono'] ?? '');
$promociones = trim($_POST['promociones'] ?? '');

$modelos = $_POST['modelo_negocio'] ?? [];
$modelos_texto = is_array($modelos) ? implode(', ', $modelos) : '';

if ($correo_principal === '' || $nombre_comercial === '' || $telefono === '' || $promociones === '') {
    response(false, 'Faltan campos obligatorios.');
}

if (!filter_var($correo_principal, FILTER_VALIDATE_EMAIL)) {
    response(false, 'El correo principal no es válido.');
}

if ($correo_empresa !== '' && !filter_var($correo_empresa, FILTER_VALIDATE_EMAIL)) {
    response(false, 'El correo empresarial no es válido.');
}

if ($usuario_principal_correo !== '' && !filter_var($usuario_principal_correo, FILTER_VALIDATE_EMAIL)) {
    response(false, 'El correo del usuario principal no es válido.');
}

$mail = new PHPMailer(true);

try {
    // CREDENCIALES SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.tudominio.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'registro@dddtraveling.com';
    $mail->Password   = 'AQUI_TU_PASSWORD_SMTP';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->CharSet = 'UTF-8';

    // REMITENTE Y DESTINO
    $mail->setFrom('registro@dddtraveling.com', 'ABC Travelling Registro');
    $mail->addAddress('tucorreo@dddtraveling.com', 'DDD Traveling');

    // Reply-To útil
    $mail->addReplyTo($correo_principal, $nombre_comercial);

    // ADJUNTO
    if (isset($_FILES['logotipo_empresa']) && $_FILES['logotipo_empresa']['error'] === UPLOAD_ERR_OK) {
        $mail->addAttachment(
            $_FILES['logotipo_empresa']['tmp_name'],
            $_FILES['logotipo_empresa']['name']
        );
    }

    $mail->isHTML(true);
    $mail->Subject = 'Nuevo registro ABC Travelling - ' . $nombre_comercial;

    $mail->Body = '
        <h2>Nuevo registro recibido</h2>
        <p><strong>Correo principal:</strong> ' . htmlspecialchars($correo_principal) . '</p>
        <p><strong>Nombre comercial:</strong> ' . htmlspecialchars($nombre_comercial) . '</p>
        <p><strong>Logotipo adjunto:</strong> ' . (isset($_FILES['logotipo_empresa']) && $_FILES['logotipo_empresa']['error'] === UPLOAD_ERR_OK ? 'Sí' : 'No') . '</p>
        <p><strong>Dueño o gerente:</strong> ' . htmlspecialchars($owner_name) . '</p>
        <p><strong>Correo empresarial:</strong> ' . htmlspecialchars($correo_empresa) . '</p>
        <p><strong>Teléfono:</strong> ' . htmlspecialchars($telefono) . '</p>
        <p><strong>Mercados operados:</strong> ' . htmlspecialchars($mercados) . '</p>
        <p><strong>Modelo de negocio:</strong> ' . htmlspecialchars($modelos_texto) . '</p>
        <p><strong>Usuario principal:</strong> ' . htmlspecialchars($usuario_principal_nombre) . '</p>
        <p><strong>Correo usuario principal:</strong> ' . htmlspecialchars($usuario_principal_correo) . '</p>
        <p><strong>Teléfono usuario principal:</strong> ' . htmlspecialchars($usuario_principal_telefono) . '</p>
        <p><strong>Desea promociones:</strong> ' . htmlspecialchars($promociones) . '</p>
    ';

    $mail->AltBody =
        "Nuevo registro recibido\n\n" .
        "Correo principal: $correo_principal\n" .
        "Nombre comercial: $nombre_comercial\n" .
        "Dueño o gerente: $owner_name\n" .
        "Correo empresarial: $correo_empresa\n" .
        "Teléfono: $telefono\n" .
        "Mercados operados: $mercados\n" .
        "Modelo de negocio: $modelos_texto\n" .
        "Usuario principal: $usuario_principal_nombre\n" .
        "Correo usuario principal: $usuario_principal_correo\n" .
        "Teléfono usuario principal: $usuario_principal_telefono\n" .
        "Desea promociones: $promociones\n";

    $mail->send();

    response(true, 'Correo enviado correctamente.');
} catch (Exception $e) {
    response(false, 'Error al enviar correo: ' . $mail->ErrorInfo);
}