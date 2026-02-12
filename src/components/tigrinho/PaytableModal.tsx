'use client';

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';

const SYMBOLS_INFO = [
  { emoji: '\uD83D\uDC15', name: 'Caramelo (Wild)', type: 'WILD', m3: 10, m4: 25, m5: 100, color: 'text-orange-400' },
  { emoji: '\uD83D\uDC8E', name: 'Diamante', type: 'Premium', m3: 5, m4: 15, m5: 50, color: 'text-cyan-400' },
  { emoji: '\uD83C\uDF40', name: 'Trevo', type: 'Premium', m3: 4, m4: 12, m5: 40, color: 'text-green-400' },
  { emoji: '\uD83D\uDCB0', name: 'Moeda', type: 'Regular', m3: 3, m4: 8, m5: 25, color: 'text-yellow-400' },
  { emoji: '\u2B50', name: 'Estrela', type: 'Regular', m3: 2, m4: 5, m5: 15, color: 'text-yellow-300' },
  { emoji: '\u2728', name: 'Scatter', type: 'Scatter', m3: '-', m4: '-', m5: '-', color: 'text-purple-400' },
];

interface PaytableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaytableModal({ isOpen, onClose }: PaytableModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside" classNames={{
      base: 'bg-[#1a1a2e] border border-yellow-600/30',
      header: 'border-b border-yellow-600/20',
      body: 'py-4',
    }}>
      <ModalContent>
        <ModalHeader className="text-yellow-400 text-xl font-bold">
          Caramelinho - Tabela de Premios
        </ModalHeader>
        <ModalBody>
          {/* Symbols Table */}
          <div className="mb-6">
            <h3 className="text-yellow-300 font-semibold mb-3 text-lg">Pagamentos por Simbolo</h3>
            <p className="text-gray-400 text-sm mb-3">Multiplicadores aplicados sobre (aposta / 20 linhas):</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-2 text-gray-400">Simbolo</th>
                    <th className="text-center py-2 px-2 text-gray-400">Tipo</th>
                    <th className="text-center py-2 px-2 text-gray-400">3x</th>
                    <th className="text-center py-2 px-2 text-gray-400">4x</th>
                    <th className="text-center py-2 px-2 text-gray-400">5x</th>
                  </tr>
                </thead>
                <tbody>
                  {SYMBOLS_INFO.map((sym, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 px-2">
                        <span className="text-2xl mr-2">{sym.emoji}</span>
                        <span className={`${sym.color} font-medium`}>{sym.name}</span>
                      </td>
                      <td className="text-center py-2 px-2 text-gray-400">{sym.type}</td>
                      <td className="text-center py-2 px-2 text-white font-mono">{sym.m3}x</td>
                      <td className="text-center py-2 px-2 text-white font-mono">{sym.m4}x</td>
                      <td className="text-center py-2 px-2 text-white font-mono">{sym.m5}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Special Features */}
          <div className="mb-6">
            <h3 className="text-yellow-300 font-semibold mb-3 text-lg">Funcoes Especiais</h3>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-orange-400 font-semibold">{'\uD83D\uDC15'} Caramelo (Wild)</p>
                <p className="text-gray-300 text-sm mt-1">
                  Substitui todos os simbolos exceto o Scatter. Simbolo que mais paga.
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-purple-400 font-semibold">{'\u2728'} Scatter (Giros Gratis)</p>
                <p className="text-gray-300 text-sm mt-1">
                  Acerte 3 ou mais simbolos Scatter em qualquer posicao nos rolos para ativar <span className="text-yellow-400 font-bold">10 Giros Gratis</span>.
                  Scatters nao precisam estar em uma linha de pagamento.
                </p>
              </div>
            </div>
          </div>

          {/* Paylines Info */}
          <div className="mb-4">
            <h3 className="text-yellow-300 font-semibold mb-3 text-lg">Linhas de Pagamento</h3>
            <p className="text-gray-300 text-sm mb-2">
              Este jogo possui <span className="text-yellow-400 font-bold">20 linhas de pagamento</span> em 5 rolos com 3 linhas visiveis.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div className="bg-white/5 rounded p-2">
                <span className="text-white">Linhas 1-3:</span> Horizontal (topo, meio, baixo)
              </div>
              <div className="bg-white/5 rounded p-2">
                <span className="text-white">Linhas 4-5:</span> Formas em V e V invertido
              </div>
              <div className="bg-white/5 rounded p-2">
                <span className="text-white">Linhas 6-7:</span> Linhas diagonais
              </div>
              <div className="bg-white/5 rounded p-2">
                <span className="text-white">Linhas 8-20:</span> Zigzags e padroes especiais
              </div>
            </div>
          </div>

          {/* Rules */}
          <div>
            <h3 className="text-yellow-300 font-semibold mb-3 text-lg">Regras</h3>
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>Ganhos sao avaliados da esquerda para a direita a partir do rolo 1</li>
              <li>Apenas o maior ganho por linha e pago</li>
              <li>Wild substitui todos os simbolos exceto Scatter</li>
              <li>Ganhos com Scatter sao independentes das linhas</li>
              <li>A aposta e dividida igualmente entre as 20 linhas</li>
            </ul>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="warning" variant="flat" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
