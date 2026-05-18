<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class ResetController extends Controller
{
    public function resetApplication(Request $request)
    {
        // IMPORTANT: Ajouter des vérifications de sécurité strictes ici !
        // Par exemple, vérifier que l'utilisateur est un administrateur autorisé,
        // et potentiellement demander une confirmation ou un mot de passe spécifique.
        // if (! auth()->guard('admin')->check() || ! auth()->guard('admin')->user()->hasPermission('reset_data')) {
        //     return response()->json(['message' => 'Unauthorized'], 403);
        // }

        $batFilePath = base_path('reset_bagisto.bat');

        if (!file_exists($batFilePath)) {
            Log::error('Batch file not found: ' . $batFilePath);
            return response()->json(['message' => 'Failed to reset application data.', 'error' => 'Batch file not found.'], 500);
        }

        // Use Process component for better control over the external command
        $process = new Process([$batFilePath]);
        $process->setWorkingDirectory(base_path());
        $process->setTimeout(3600); // Set a generous timeout (e.g., 1 hour)

        try {
            $process->run();

            if (!$process->isSuccessful()) {
                Log::error('Bagisto Reset Error (Batch File): ' . $process->getErrorOutput());
                return response()->json(['message' => 'Failed to reset application data.', 'error' => $process->getErrorOutput()], 500);
            }

            Log::info('Application data reset successfully via batch file.');
            return response()->json(['message' => 'Application data reset successfully and re-seeded.'], 200);
        } catch (\Exception $e) {
            Log::error('Bagisto Reset Exception: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to reset application data.', 'error' => $e->getMessage()], 500);
        }
    }
}