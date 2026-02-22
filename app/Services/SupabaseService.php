<?php

namespace App\Services;

use Exception;
use Illuminate\Http\UploadedFile;

class SupabaseService
{
    private $supabaseUrl;
    private $supabaseKey;
    private $certificatesBucket;
    private $profilesBucket;

    public function __construct()
    {
        $this->supabaseUrl = config('services.supabase.url');
        $this->supabaseKey = config('services.supabase.anon_key');
        $this->certificatesBucket = config('services.supabase.buckets.certificates');
        $this->profilesBucket = config('services.supabase.buckets.profiles');
    }

    /**
     * Upload a file to Supabase storage.
     */
    public function uploadFile(UploadedFile $file, string $bucket, string $path = ''): ?string
    {
        try {
            $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $filePath = $path ? "{$path}/{$fileName}" : $fileName;

            $fileContent = file_get_contents($file->getRealPath());

            $url = "{$this->supabaseUrl}/storage/v1/object/{$bucket}/{$filePath}";

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_PUT, true);
            curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
            curl_setopt($ch, CURLOPT_INFILE, fopen($file->getRealPath(), 'r'));
            curl_setopt($ch, CURLOPT_INFILESIZE, filesize($file->getRealPath()));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $this->supabaseKey,
                'Content-Type: ' . $file->getMimeType(),
            ]);

            $response = curl_exec($ch);
            curl_close($ch);

            if ($response === false) {
                throw new Exception('Failed to upload file to Supabase');
            }

            return "{$this->supabaseUrl}/storage/v1/object/public/{$bucket}/{$filePath}";
        } catch (Exception $e) {
            report($e);
            return null;
        }
    }

    /**
     * Upload certificate file.
     */
    public function uploadCertificate(UploadedFile $file): ?string
    {
        return $this->uploadFile($file, $this->certificatesBucket, 'certificates');
    }

    /**
     * Upload profile picture.
     */
    public function uploadProfilePicture(UploadedFile $file): ?string
    {
        return $this->uploadFile($file, $this->profilesBucket, 'profiles');
    }

    /**
     * Delete a file from Supabase storage.
     */
    public function deleteFile(string $bucket, string $filePath): bool
    {
        try {
            $url = "{$this->supabaseUrl}/storage/v1/object/{$bucket}/{$filePath}";

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $this->supabaseKey,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            return $httpCode === 200 || $httpCode === 204;
        } catch (Exception $e) {
            report($e);
            return false;
        }
    }

    /**
     * Generate a public URL for a file.
     */
    public function getPublicUrl(string $bucket, string $filePath): string
    {
        return "{$this->supabaseUrl}/storage/v1/object/public/{$bucket}/{$filePath}";
    }
}
