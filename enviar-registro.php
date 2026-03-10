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

function buildEmailHtml(array $data): string
{
    $rows = [
        'Correo principal' => $data['correo_principal'],
        'Nombre comercial' => $data['nombre_comercial'],
        'Logotipo adjunto' => $data['logotipo_adj'],
        'Nombre del dueño o gerente' => $data['owner_name'],
        'Correo de contacto' => $data['correo_contacto'],
        'Teléfono' => $data['telefono'],
        'Mercados operados' => $data['mercados'],
        'Modelo de negocio' => $data['modelos_texto'],
        'Usuario principal' => $data['usuario_principal_nombre'],
        'Correo del usuario principal' => $data['usuario_principal_correo'],
        'Teléfono del usuario principal' => $data['usuario_principal_telefono'],
        'Promociones' => $data['promociones'],
    ];

    $tableRows = '';
    foreach ($rows as $label => $value) {
        $tableRows .= '
            <tr>
                <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;background:#f8fafc;font-weight:700;color:#1c2636;width:260px;">
                    ' . h($label) . '
                </td>
                <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;color:#334155;background:#ffffff;">
                    ' . h($value) . '
                </td>
            </tr>
        ';
    }

    return '
    <div style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:840px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 18px 45px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(90deg,#1c2636 0%,#243248 100%);padding:28px 30px;">
                <div style="font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:#cbd5e1;font-weight:700;">
                    ABC Travelling
                </div>
                <h1 style="margin:8px 0 0 0;font-size:28px;line-height:1.15;color:#ffffff;">
                    Nuevo registro recibido
                </h1>
                <p style="margin:10px 0 0 0;font-size:14px;line-height:1.5;color:#dbe4ee;">
                    Se ha enviado un nuevo formulario desde el sitio web.
                </p>
            </div>

            <div style="padding:28px 30px 10px 30px;">
                <div style="display:inline-block;background:#f8f5ee;color:#8c7547;border:1px solid #eadfca;border-radius:999px;padding:8px 14px;font-size:12px;font-weight:700;letter-spacing:.4px;">
                    Registro de negocio y usuario principal
                </div>

                <p style="margin:18px 0 22px 0;color:#475569;font-size:14px;line-height:1.6;">
                    A continuación se muestran los datos capturados en el formulario:
                </p>

                <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
                    ' . $tableRows . '
                </table>
            </div>

            <div style="padding:20px 30px 28px 30px;">
                <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:14px 16px;color:#64748b;font-size:13px;line-height:1.5;">
                    Este correo fue generado automáticamente por el formulario de registro de ABC Travelling.
                </div>
            </div>
        </div>
    </div>';
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
$correo_principal = trim((string)($_POST['correo_principal'] ?? ''));
$nombre_comercial = trim((string)($_POST['nombre_comercial'] ?? ''));
$owner_name = trim((string)($_POST['owner_name'] ?? ''));
$correo_contacto = trim((string)($_POST['correo_contacto'] ?? ''));
$telefono = trim((string)($_POST['telefono'] ?? ''));
$mercados = trim((string)($_POST['mercados'] ?? ''));
$usuario_principal_nombre = trim((string)($_POST['usuario_principal_nombre'] ?? ''));
$usuario_principal_correo = trim((string)($_POST['usuario_principal_correo'] ?? ''));
$usuario_principal_telefono = trim((string)($_POST['usuario_principal_telefono'] ?? ''));
$promociones = trim((string)($_POST['promociones'] ?? ''));

$modelos = $_POST['modelo_negocio'] ?? [];
if (!is_array($modelos)) {
    $modelos = [];
}
$modelos = array_values(array_filter(array_map(
    static fn($value) => trim((string)$value),
    $modelos
), static fn($value) => $value !== ''));

$modelosPermitidos = ['B2C', 'B2B', 'B2C2B'];
foreach ($modelos as $modelo) {
    if (!in_array($modelo, $modelosPermitidos, true)) {
        responseJson(false, 'Se recibió un modelo de negocio no válido.');
    }
}
$modelos_texto = implode(', ', $modelos);

/*
|--------------------------------------------------------------------------
| Validaciones del formulario
|--------------------------------------------------------------------------
*/
$requiredFields = [
    'correo_principal' => $correo_principal,
    'nombre_comercial' => $nombre_comercial,
    'owner_name' => $owner_name,
    'correo_contacto' => $correo_contacto,
    'telefono' => $telefono,
    'mercados' => $mercados,
    'usuario_principal_nombre' => $usuario_principal_nombre,
    'usuario_principal_correo' => $usuario_principal_correo,
    'usuario_principal_telefono' => $usuario_principal_telefono,
    'promociones' => $promociones,
];

foreach ($requiredFields as $fieldName => $fieldValue) {
    if ($fieldValue === '') {
        responseJson(false, "Falta el campo obligatorio: {$fieldName}.");
    }
}

if (!filter_var($correo_principal, FILTER_VALIDATE_EMAIL)) {
    responseJson(false, 'El correo principal no es válido.');
}

if (!filter_var($correo_contacto, FILTER_VALIDATE_EMAIL)) {
    responseJson(false, 'El correo de contacto no es válido.');
}

if (!filter_var($usuario_principal_correo, FILTER_VALIDATE_EMAIL)) {
    responseJson(false, 'El correo del usuario principal no es válido.');
}

if (!preg_match('/^[0-9]{10,12}$/', $telefono)) {
    responseJson(false, 'El teléfono principal debe contener entre 10 y 12 dígitos.');
}

if (!preg_match('/^[0-9]{10,12}$/', $usuario_principal_telefono)) {
    responseJson(false, 'El teléfono del usuario principal debe contener entre 10 y 12 dígitos.');
}

if (count($modelos) === 0) {
    responseJson(false, 'Debes seleccionar al menos un modelo de negocio.');
}

$promocionNormalizada = mb_strtolower($promociones, 'UTF-8');
if (!in_array($promocionNormalizada, ['si', 'sí', 'no', 'yes'], true)) {
    responseJson(false, 'La opción de promociones no es válida.');
}

/*
|--------------------------------------------------------------------------
| Validación del archivo adjunto - ahora obligatorio
|--------------------------------------------------------------------------
*/
if (
    !isset($_FILES['logotipo_empresa']) ||
    !is_array($_FILES['logotipo_empresa']) ||
    (int)($_FILES['logotipo_empresa']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE
) {
    responseJson(false, 'Debes subir el logotipo de la empresa.');
}

$file = $_FILES['logotipo_empresa'];

if ((int)($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
    responseJson(false, 'Hubo un problema al subir el archivo.');
}

$archivoTmp = (string)($file['tmp_name'] ?? '');
$archivoNombre = (string)($file['name'] ?? '');

if ($archivoTmp === '' || !is_uploaded_file($archivoTmp)) {
    responseJson(false, 'El archivo subido no es válido.');
}

$maxFileSize = 8 * 1024 * 1024;
if ((int)($file['size'] ?? 0) > $maxFileSize) {
    responseJson(false, 'El archivo supera el tamaño máximo permitido de 8MB.');
}

$extension = strtolower((string)pathinfo($archivoNombre, PATHINFO_EXTENSION));
$allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'pdf'];

if (!in_array($extension, $allowedExtensions, true)) {
    responseJson(false, 'Formato de archivo no permitido. Solo PNG, JPG, JPEG, WEBP, SVG o PDF.');
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
        $mail->addReplyTo(
            $correo_principal,
            $nombre_comercial !== '' ? $nombre_comercial : 'Contacto de registro'
        );
    }

    $mail->addAttachment($archivoTmp, $archivoNombre);

    $mail->isHTML(true);
    $mail->Subject = 'Nuevo registro ABC Travelling - ' . $nombre_comercial;

    $mail->Body = buildEmailHtml([
        'correo_principal' => $correo_principal,
        'nombre_comercial' => $nombre_comercial,
        'logotipo_adj' => 'Sí',
        'owner_name' => $owner_name,
        'correo_contacto' => $correo_contacto,
        'telefono' => $telefono,
        'mercados' => $mercados,
        'modelos_texto' => $modelos_texto,
        'usuario_principal_nombre' => $usuario_principal_nombre,
        'usuario_principal_correo' => $usuario_principal_correo,
        'usuario_principal_telefono' => $usuario_principal_telefono,
        'promociones' => $promocionNormalizada,
    ]);

    $mail->AltBody =
        "Nuevo registro recibido\n\n" .
        "Correo principal: {$correo_principal}\n" .
        "Nombre comercial: {$nombre_comercial}\n" .
        "Logotipo adjunto: Sí\n" .
        "Nombre del dueño o gerente: {$owner_name}\n" .
        "Correo de contacto: {$correo_contacto}\n" .
        "Teléfono: {$telefono}\n" .
        "Mercados operados: {$mercados}\n" .
        "Modelo de negocio: {$modelos_texto}\n" .
        "Usuario principal: {$usuario_principal_nombre}\n" .
        "Correo del usuario principal: {$usuario_principal_correo}\n" .
        "Teléfono del usuario principal: {$usuario_principal_telefono}\n" .
        "Promociones: {$promociones}\n";

    $mail->send();

    responseJson(true, 'Correo enviado correctamente.');
} catch (Exception $e) {
    responseJson(false, 'Error al enviar correo: ' . $mail->ErrorInfo);
} catch (Throwable $e) {
    responseJson(false, 'Error interno del servidor: ' . $e->getMessage());
}