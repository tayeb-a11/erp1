<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ERPSubscriptionController extends Controller
{
    protected $globalApiUrl;

    public function __construct()
    {
        $this->globalApiUrl = 'https://cokitana.ddnsfree.com/api/tenant/check-by-subdomain';
    }

    /**
     * Vérifier le statut d'abonnement du tenant actuel
     */
    public function checkSubscription(Request $request): JsonResponse
    {
        $subdomain = $this->extractSubdomain($request->getHost());
        
        if (!$subdomain) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible d\'extraire le subdomain',
                'data' => null
            ], 400);
        }

        $subscriptionStatus = $this->checkSubscriptionFromGlobalAPI($subdomain);
        
        if ($subscriptionStatus === null) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification de l\'abonnement',
                'data' => null
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => $subscriptionStatus['is_expired'] ? 'Abonnement expiré' : 'Abonnement actif',
            'data' => $subscriptionStatus
        ]);
    }

    /**
     * Obtenir le statut d'abonnement pour affichage
     */
    public function getSubscriptionStatus(Request $request): JsonResponse
    {
        $subscriptionStatus = $request->attributes->get('subscription_status');
        
        if (!$subscriptionStatus) {
            return response()->json([
                'success' => false,
                'message' => 'Statut d\'abonnement non disponible',
                'data' => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Statut d\'abonnement récupéré',
            'data' => $subscriptionStatus
        ]);
    }

    /**
     * Rediriger vers la page d'expiration
     */
    public function redirectToExpiredPage(): \Illuminate\Http\RedirectResponse
    {
        return redirect()->away('https://cokitana.ddnsfree.com/tenant/subscription-expired');
    }

    /**
     * Extraire le subdomain de l'host
     */
    private function extractSubdomain(string $host): ?string
    {
        // Supprimer le port si présent
        $host = preg_replace('/:\d+$/', '', $host);
        
        // Extraire le subdomain (première partie avant le premier point)
        $parts = explode('.', $host);
        
        if (count($parts) >= 2) {
            return $parts[0];
        }
        
        return null;
    }

    /**
     * Vérifier l'abonnement via l'API globale
     */
    private function checkSubscriptionFromGlobalAPI(string $subdomain): ?array
    {
        try {
            $response = Http::timeout(10)
                ->post($this->globalApiUrl, [
                    'subdomain' => $subdomain
                ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['success']) && $data['success'] && isset($data['data'])) {
                    return $data['data'];
                }
            }
            
            Log::error('ERPSubscriptionController: Réponse API invalide', [
                'subdomain' => $subdomain,
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            
        } catch (\Exception $e) {
            Log::error('ERPSubscriptionController: Exception lors de l\'appel API', [
                'subdomain' => $subdomain,
                'error' => $e->getMessage()
            ]);
        }
        
        return null;
    }
} 
