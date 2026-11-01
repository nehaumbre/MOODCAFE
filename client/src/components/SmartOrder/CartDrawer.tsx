import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { X, Trash2, Plus, Minus, ShoppingBag, Coffee, ArrowRight, Table as TableIcon } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartItemCount,
    isCartOpen,
    setIsCartOpen,
    selectedTable,
    submitOrder,
    currentMood,
  } = useCafe();

  const [customerName, setCustomerName] = useState('Yuki Sato');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await submitOrder(customerName, orderType);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-sumi-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-washi-50 border-l border-washi-300 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-washi-200 flex items-center justify-between bg-washi-100/60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sumi-900 text-washi-50 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-sumi-900 text-base">Digital Shōkenki Order</h2>
                <div className="text-[10px] text-sumi-500 font-mono">券売機 • Ticket Cart ({cartItemCount} items)</div>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-washi-200 hover:bg-washi-300 text-sumi-700 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-washi-200/80 flex items-center justify-center text-sumi-400">
                  <Coffee className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-serif font-semibold text-sumi-800">Your ticket cart is empty</p>
                  <p className="text-xs text-sumi-500 mt-1 max-w-xs">
                    Explore our Mood Menu and select items crafted for your current headspace.
                  </p>
                </div>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-washi-100/60 p-3.5 rounded-2xl border border-washi-200 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-serif font-bold text-sumi-900 text-xs sm:text-sm">
                        {item.menuItem.name}
                      </h4>
                      <span className="font-mono text-xs font-bold text-sumi-800 ml-2">
                        ₹{item.unitPrice * item.quantity}
                      </span>
                    </div>
                    <div className="text-[10px] text-sumi-500 font-serif">
                      {item.menuItem.japaneseName} • {item.size === 'L' ? 'Large' : 'Regular'}
                    </div>

                    {item.customization && (
                      <div className="text-[10px] text-sumi-600 font-mono flex flex-wrap gap-1 mt-1">
                        {item.customization.temperature && (
                          <span className="bg-washi-200 px-1 py-0.5 rounded">
                            {item.customization.temperature}
                          </span>
                        )}
                        {item.customization.milk && (
                          <span className="bg-washi-200 px-1 py-0.5 rounded">
                            {item.customization.milk}
                          </span>
                        )}
                        {item.customization.sweetness && (
                          <span className="bg-washi-200 px-1 py-0.5 rounded">
                            Sweet: {item.customization.sweetness}
                          </span>
                        )}
                        {item.customization.iceLevel && (
                          <span className="bg-washi-200 px-1 py-0.5 rounded">
                            Ice: {item.customization.iceLevel}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Quantity controls */}
                    <div className="flex items-center space-x-2 pt-2">
                      <div className="flex items-center space-x-1.5 bg-washi-200/80 rounded-lg p-0.5">
                        <button
                          onClick={() => updateCartQuantity(idx, -1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-sumi-700 hover:bg-washi-300 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold px-1.5">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(idx, 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-sumi-700 hover:bg-washi-300 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(idx)}
                        className="text-sumi-400 hover:text-rose-600 transition p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout & Ticket Issuance Options */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-washi-200 bg-washi-100/50 space-y-4">
              
              {/* Order Type Toggle (Dine In vs Takeaway) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-sumi-700 uppercase tracking-wider block">
                  利用方法 • Dining Option
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOrderType('dine-in')}
                    className={`py-2 px-3 rounded-xl border font-medium flex items-center justify-center space-x-1.5 transition ${
                      orderType === 'dine-in'
                        ? 'border-sumi-900 bg-sumi-900 text-washi-50'
                        : 'border-washi-200 bg-washi-50 text-sumi-700'
                    }`}
                  >
                    <span>店内 Dine-in</span>
                    {selectedTable && (
                      <span className="text-[10px] font-mono bg-washi-700 text-washi-100 px-1 rounded">
                        {selectedTable.id}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`py-2 px-3 rounded-xl border font-medium transition ${
                      orderType === 'takeaway'
                        ? 'border-sumi-900 bg-sumi-900 text-washi-50'
                        : 'border-washi-200 bg-washi-50 text-sumi-700'
                    }`}
                  >
                    持帰 Takeaway
                  </button>
                </div>

                {orderType === 'dine-in' && (
                  <div className="text-[11px] text-sumi-600 pt-1 flex items-center justify-between">
                    <span>
                      {selectedTable ? `Linked Table: ${selectedTable.name}` : 'No table pre-selected (Order & choose seat)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-sumi-700 uppercase tracking-wider block">
                  お名前 • Guest / Order Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter guest name"
                  className="w-full text-xs p-2.5 rounded-xl border border-washi-200 bg-washi-50 focus:outline-none focus:border-sumi-900 font-medium"
                />
              </div>

              {/* Error display */}
              {errorMessage && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                  {errorMessage}
                </div>
              )}

              {/* Total & Submit Button */}
              <div className="pt-2 border-t border-washi-200 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] text-sumi-500 font-mono">TOTAL DUE</div>
                    <div className="text-xs text-matcha-700 font-medium">Mood: {currentMood}</div>
                  </div>
                  <div className="font-mono text-2xl font-bold text-sumi-900">
                    ₹{cartTotal}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-matcha-700 hover:bg-matcha-800 active:scale-[0.98] text-washi-50 rounded-2xl font-serif font-bold text-sm tracking-wide shadow-zen transition flex items-center justify-center space-x-2"
                >
                  <span>{isSubmitting ? 'Printing Ticket...' : '発券 • Issue Shōkenki Ticket'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
