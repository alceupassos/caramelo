'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@heroui/react';
import { ProvablyFairRNG } from '@/utils/rng';

interface FairnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameData?: {
    serverSeed?: string;
    clientSeed: string;
    nonce: number;
    hashedServerSeed: string;
    result?: number;
    gameType: string;
  };
}

const FairnessModal = ({ isOpen, onClose, gameData }: FairnessModalProps) => {
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    result: number;
  } | null>(null);
  const [manualServerSeed, setManualServerSeed] = useState('');

  const handleVerify = async () => {
    if (!gameData) return;
    const seedToVerify = gameData.serverSeed || manualServerSeed;
    if (!seedToVerify) return;

    setVerifying(true);
    try {
      const result = await ProvablyFairRNG.verify(
        seedToVerify,
        gameData.clientSeed,
        gameData.nonce,
        gameData.hashedServerSeed,
      );
      setVerificationResult({
        verified: result.verified,
        result: result.result,
      });
    } catch {
      setVerificationResult({ verified: false, result: 0 });
    }
    setVerifying(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Provably Fair - Verificacao
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Server Seed Hash (pre-jogo)</p>
              <code className="block bg-gray-900 p-2 rounded text-xs text-green-400 break-all">
                {gameData?.hashedServerSeed || 'N/A'}
              </code>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Client Seed</p>
              <code className="block bg-gray-900 p-2 rounded text-xs text-blue-400 break-all">
                {gameData?.clientSeed || 'N/A'}
              </code>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Nonce</p>
              <code className="block bg-gray-900 p-2 rounded text-xs text-white">
                {gameData?.nonce ?? 'N/A'}
              </code>
            </div>

            {gameData?.serverSeed ? (
              <div>
                <p className="text-sm text-gray-400 mb-1">Server Seed (revelado)</p>
                <code className="block bg-gray-900 p-2 rounded text-xs text-yellow-400 break-all">
                  {gameData.serverSeed}
                </code>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-400 mb-1">Server Seed (insira para verificar)</p>
                <Input
                  value={manualServerSeed}
                  onChange={(e) => setManualServerSeed(e.target.value)}
                  placeholder="Cole o server seed aqui..."
                  size="sm"
                />
              </div>
            )}

            {verificationResult && (
              <div className={`p-4 rounded-lg border-2 ${
                verificationResult.verified
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-red-500 bg-red-900/20'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {verificationResult.verified ? '✅' : '❌'}
                  </span>
                  <span className={`font-bold ${
                    verificationResult.verified ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {verificationResult.verified ? 'VERIFICADO' : 'FALHOU'}
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  SHA-256(serverSeed) {verificationResult.verified ? '===' : '!=='} hashedServerSeed
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Resultado: {verificationResult.result.toFixed(8)}
                </p>
              </div>
            )}

            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong>Como funciona:</strong> Antes do jogo, o hash SHA-256 do server seed
                e mostrado. Apos o jogo, o server seed e revelado. Voce pode verificar que
                SHA-256(serverSeed) === hash mostrado, provando que o resultado nao foi manipulado.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="flat" onPress={onClose}>
            Fechar
          </Button>
          <Button
            color="primary"
            onPress={handleVerify}
            isLoading={verifying}
            isDisabled={!gameData || (!gameData.serverSeed && !manualServerSeed)}
          >
            Verificar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FairnessModal;
