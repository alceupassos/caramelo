'use client';

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';

const SYMBOLS_INFO = [
  { emoji: '\uD83D\uDC2F', name: 'Tiger (Wild)', type: 'WILD', m3: 10, m4: 25, m5: 100, color: 'text-orange-400' },
  { emoji: '\uD83D\uDC8E', name: 'Diamond', type: 'Premium', m3: 5, m4: 15, m5: 50, color: 'text-cyan-400' },
  { emoji: '\uD83C\uDF40', name: 'Clover', type: 'Premium', m3: 4, m4: 12, m5: 40, color: 'text-green-400' },
  { emoji: '\uD83D\uDCB0', name: 'Coin', type: 'Regular', m3: 3, m4: 8, m5: 25, color: 'text-yellow-400' },
  { emoji: '\u2B50', name: 'Star', type: 'Regular', m3: 2, m4: 5, m5: 15, color: 'text-yellow-300' },
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
          Tigrinho - Paytable
        </ModalHeader>
        <ModalBody>
          {/* Symbols Table */}
          <div className="mb-6">
            <h3 className="text-yellow-300 font-semibold mb-3 text-lg">Symbol Payouts</h3>
            <p className="text-gray-400 text-sm mb-3">Multipliers applied to (bet / 20 paylines):</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-2 text-gray-400">Symbol</th>
                    <th className="text-center py-2 px-2 text-gray-400">Type</th>
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
            <h3 className="text-yellow-300 font-semibold mb-3 text-lg">Special Features</h3>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-orange-400 font-semibold">{'\uD83D\uDC2F'} Tiger (Wild)</p>
                <p className="text-gray-300 text-sm mt-1">
                  Substitutes for all symbols except Scatter. Highest paying symbol.
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-purple-400 font-semibold">{'\u2728'} Scatter (Free Spins)</p>
                <p className="text-gray-300 text-sm mt-1">
                  Land 3 or more Scatter symbols anywhere on the reels to trigger <span className="text-yellow-400 font-bold">10 Free Spins</span>.
                  Scatters do not need to be on a payline.
                </p>
              </div>
            </div>
          </div>

          {/* Paylines Info */}
          <div className="mb-4">
            <h3 className="text-yellow-300 font-semibold mb-3 text-lg">Paylines</h3>
            <p className="text-gray-300 text-sm mb-2">
              This game features <span className="text-yellow-400 font-bold">20 paylines</span> across 5 reels with 3 visible rows.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div className="bg-white/5 rounded p-2">
                <span className="text-white">Lines 1-3:</span> Horizontal (top, middle, bottom)
              </div>
              <div className="bg-white/5 rounded p-2">
                <span className="text-white">Lines 4-5:</span> V and inverted V shapes
              </div>
              <div className="bg-white/5 rounded p-2">
                <span className="text-white">Lines 6-7:</span> Diagonal lines
              </div>
              <div className="bg-white/5 rounded p-2">
                <span className="text-white">Lines 8-20:</span> Zigzags and special patterns
              </div>
            </div>
          </div>

          {/* Rules */}
          <div>
            <h3 className="text-yellow-300 font-semibold mb-3 text-lg">Rules</h3>
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>Wins are evaluated left to right starting from reel 1</li>
              <li>Only the highest win per payline is paid</li>
              <li>Wild substitutes for all symbols except Scatter</li>
              <li>Scatter wins are independent of paylines</li>
              <li>Bet is divided equally across all 20 paylines</li>
            </ul>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="warning" variant="flat" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
