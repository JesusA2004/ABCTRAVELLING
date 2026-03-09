<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

function responseJson(bool $ok, string $message, array $extra = []): void
{
    echo json_encode(array_merge([
        'ok' => $ok,
        'message' => $message,
    ], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

function envValue(string $key, ?string $default = null): ?string
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? $default;

    if (is_string($value)) {
        return trim($value);
    }

    return $value;
}

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responseJson(false, 'Método no permitido.');
}

/*
|--------------------------------------------------------------------------
| Validar variables del .env
|--------------------------------------------------------------------------
*/
$requiredEnv = [
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_USERNAME',
    'MAIL_PASSWORD',
    'MAIL_ENCRYPTION',
    'MAIL_FROM_ADDRESS',
    'MAIL_FROM_NAME',
    'MAIL_TO_ADDRESS',
    'MAIL_TO_NAME',
];

foreach ($requiredEnv as $envKey) {
    if (envValue($envKey) === null || envValue($envKey) === '') {
        responseJson(false, "Falta la variable de entorno {$envKey} en el .env.");
    }
}

/*
|--------------------------------------------------------------------------
| Recibir datos del formulario
|--------------------------------------------------------------------------
*/
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
$modelos_texto = is_array($modelos) ? implode(', ', array_map('trim', $modelos)) : '';

/*
|--------------------------------------------------------------------------
| Validaciones del formulario
|--------------------------------------------------------------------------
*/
if ($correo_principal === '' || $nombre_comercial === '' || $telefono === '' || $promociones === '') {
    responseJson(false, 'Faltan campos obligatorios.');
}

if (!filter_var($correo_principal, FILTER_VALIDATE_EMAIL)) {
    responseJson(false, 'El correo principal no es válido.');
}

if ($correo_empresa !== '' && !filter_var($correo_empresa, FILTER_VALIDATE_EMAIL)) {
    responseJson(false, 'El correo empresarial no es válido.');
}

if ($usuario_principal_correo !== '' && !filter_var($usuario_principal_correo, FILTER_VALIDATE_EMAIL)) {
    responseJson(false, 'El correo del usuario principal no es válido.');
}

if (!preg_match('/^[0-9+\-\s()]{7,20}$/', $telefono)) {
    responseJson(false, 'El teléfono principal no tiene un formato válido.');
}

if ($usuario_principal_telefono !== '' && !preg_match('/^[0-9+\-\s()]{7,20}$/', $usuario_principal_telefono)) {
    responseJson(false, 'El teléfono del usuario principal no tiene un formato válido.');
}

if (!in_array(mb_strtolower($promociones), ['si', 'sí', 'no'], true)) {
    responseJson(false, 'La opción de promociones no es válida.');
}

/*
|--------------------------------------------------------------------------
| Validación del archivo adjunto
|--------------------------------------------------------------------------
*/
$archivoAdjuntoExiste = false;
$archivoTmp = null;
$archivoNombre = null;

if (isset($_FILES['logotipo_empresa']) && is_array($_FILES['logotipo_empresa'])) {
    $file = $_FILES['logotipo_empresa'];

    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            responseJson(false, 'Hubo un problema al subir el archivo.');
        }

        $archivoTmp = $file['tmp_name'] ?? '';
        $archivoNombre = $file['name'] ?? '';

        if ($archivoTmp === '' || !is_uploaded_file($archivoTmp)) {
            responseJson(false, 'El archivo subido no es válido.');
        }

        $maxFileSize = 8 * 1024 * 1024;
        if (($file['size'] ?? 0) > $maxFileSize) {
            responseJson(false, 'El archivo supera el tamaño máximo permitido de 8MB.');
        }

        $extension = strtolower(pathinfo($archivoNombre, PATHINFO_EXTENSION));
        $allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'pdf'];

        if (!in_array($extension, $allowedExtensions, true)) {
            responseJson(false, 'Formato de archivo no permitido. Solo PNG, JPG, JPEG, WEBP, SVG o PDF.');
        }

        $archivoAdjuntoExiste = true;
    }
}

/*
|--------------------------------------------------------------------------
| Configurar PHPMailer con .env
|--------------------------------------------------------------------------
*/
$mailHost = (string) envValue('MAIL_HOST');
$mailPort = (int) envValue('MAIL_PORT');
$mailUsername = (string) envValue('MAIL_USERNAME');
$mailPassword = (string) envValue('MAIL_PASSWORD');
$mailEncryption = strtolower((string) envValue('MAIL_ENCRYPTION'));
$mailFromAddress = (string) envValue('MAIL_FROM_ADDRESS');
$mailFromName = (string) envValue('MAIL_FROM_NAME');
$mailToAddress = (string) envValue('MAIL_TO_ADDRESS');
$mailToName = (string) envValue('MAIL_TO_NAME');

if (!filter_var($mailFromAddress, FILTER_VALIDATE_EMAIL)) {
    responseJson(false, 'MAIL_FROM_ADDRESS no es un correo válido.');
}

if (!filter_var($mailToAddress, FILTER_VALIDATE_EMAIL)) {
    responseJson(false, 'MAIL_TO_ADDRESS no es un correo válido.');
}

$smtpSecure = PHPMailer::ENCRYPTION_STARTTLS;
if ($mailEncryption === 'ssl' || $mailEncryption === 'smtps') {
    $smtpSecure = PHPMailer::ENCRYPTION_SMTPS;
}

/*
|--------------------------------------------------------------------------
| Enviar correo
|--------------------------------------------------------------------------
*/
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = $mailHost;
    $mail->SMTPAuth = true;
    $mail->Username = $mailUsername;
    $mail->Password = $mailPassword;
    $mail->SMTPSecure = $smtpSecure;
    $mail->Port = $mailPort;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom($mailFromAddress, $mailFromName);
    $mail->addAddress($mailToAddress, $mailToName);

    if (filter_var($correo_principal, FILTER_VALIDATE_EMAIL)) {
        $mail->addReplyTo($correo_principal, $nombre_comercial !== '' ? $nombre_comercial : 'Contacto de registro');
    }

    if ($archivoAdjuntoExiste && $archivoTmp !== null && $archivoNombre !== null) {
        $mail->addAttachment($archivoTmp, $archivoNombre);
    }

    $mail->isHTML(true);
    $mail->Subject = 'Nuevo registro ABC Travelling - ' . $nombre_comercial;

    $mail->Body = '
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1c2636;">
            <h2 style="margin:0 0 16px 0;color:#1c2636;">Nuevo registro recibido</h2>

            <p><strong>Correo principal:</strong> ' . h($correo_principal) . '</p>
            <p><strong>Nombre comercial:</strong> ' . h($nombre_comercial) . '</p>
            <p><strong>Logotipo adjunto:</strong> ' . ($archivoAdjuntoExiste ? 'Sí' : 'No') . '</p>
            <p><strong>Dueño o gerente:</strong> ' . h($owner_name) . '</p>
            <p><strong>Correo empresarial:</strong> ' . h($correo_empresa) . '</p>
            <p><strong>Teléfono:</strong> ' . h($telefono) . '</p>
            <p><strong>Mercados operados:</strong> ' . h($mercados) . '</p>
            <p><strong>Modelo de negocio:</strong> ' . h($modelos_texto) . '</p>
            <p><strong>Usuario principal:</strong> ' . h($usuario_principal_nombre) . '</p>
            <p><strong>Correo usuario principal:</strong> ' . h($usuario_principal_correo) . '</p>
            <p><strong>Teléfono usuario principal:</strong> ' . h($usuario_principal_telefono) . '</p>
            <p><strong>Desea promociones:</strong> ' . h($promociones) . '</p>
        </div>
    ';

    $mail->AltBody =
        "Nuevo registro recibido\n\n" .
        "Correo principal: {$correo_principal}\n" .
        "Nombre comercial: {$nombre_comercial}\n" .
        "Logotipo adjunto: " . ($archivoAdjuntoExiste ? 'Sí' : 'No') . "\n" .
        "Dueño o gerente: {$owner_name}\n" .
        "Correo empresarial: {$correo_empresa}\n" .
        "Teléfono: {$telefono}\n" .
        "Mercados operados: {$mercados}\n" .
        "Modelo de negocio: {$modelos_texto}\n" .
        "Usuario principal: {$usuario_principal_nombre}\n" .
        "Correo usuario principal: {$usuario_principal_correo}\n" .
        "Teléfono usuario principal: {$usuario_principal_telefono}\n" .
        "Desea promociones: {$promociones}\n";

    $mail->send();

    responseJson(true, 'Correo enviado correctamente.');
} catch (Exception $e) {
    responseJson(false, 'Error al enviar correo: ' . $mail->ErrorInfo);
} catch (Throwable $e) {
    responseJson(false, 'Error interno del servidor: ' . $e->getMessage());
}