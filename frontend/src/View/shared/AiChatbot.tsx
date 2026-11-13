import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
  ShieldCheck,
  FileText,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  User,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  GripHorizontal,
  Move
} from 'lucide-react';
import { UserAccount } from '../../types/index.ts';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{ label: string; action: string }>;
}

interface AiChatbotProps {
  user: UserAccount | null;
  currentView: 'landing' | 'auth' | 'profile' | 'staff';
  onNavigateView?: (view: 'landing' | 'auth' | 'profile' | 'staff') => void;
  onOpenClaimModal?: () => void;
}

export default function AiChatbot({
  user,
  currentView,
  onNavigateView,
  onOpenClaimModal
}: AiChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Position state for floating launcher button (default bottom-right)
  const [btnPos, setBtnPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingBtn, setIsDraggingBtn] = useState(false);
  const btnDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    moved: false
  });

  // Position state for chat window (default bottom-right)
  const [chatPos, setChatPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const chatDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number }>({
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0
  });

  // Initialize and clamp positions to bottom-right on mount and window resize
  useEffect(() => {
    const initPositions = () => {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

      // Default button at bottom-right: 24px from right, 24px from bottom
      // Button width ~ 200px, height ~ 48px
      setBtnPos((prev) => {
        if (!prev) {
          return {
            x: Math.max(16, vw - 220),
            y: Math.max(16, vh - 72)
          };
        }
        return {
          x: Math.min(Math.max(12, prev.x), vw - 200),
          y: Math.min(Math.max(12, prev.y), vh - 60)
        };
      });

      // Default chat modal at bottom-right
      const modalW = isExpanded ? Math.min(620, vw * 0.92) : Math.min(400, vw * 0.92);
      const modalH = isExpanded ? Math.min(720, vh * 0.82) : 540;
      setChatPos((prev) => {
        if (!prev) {
          return {
            x: Math.max(12, vw - modalW - 24),
            y: Math.max(12, vh - modalH - 24)
          };
        }
        return {
          x: Math.min(Math.max(12, prev.x), vw - modalW - 12),
          y: Math.min(Math.max(12, prev.y), vh - modalH - 12)
        };
      });
    };

    initPositions();
    window.addEventListener('resize', initPositions);
    return () => window.removeEventListener('resize', initPositions);
  }, [isExpanded]);

  // Adjust chatPos if expanding or opening to ensure it stays on screen
  useEffect(() => {
    if (isOpen) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const modalW = isExpanded ? Math.min(620, vw * 0.92) : Math.min(400, vw * 0.92);
      const modalH = isExpanded ? Math.min(720, vh * 0.82) : 540;

      setChatPos((prev) => {
        if (!prev) {
          return {
            x: Math.max(12, vw - modalW - 24),
            y: Math.max(12, vh - modalH - 24)
          };
        }
        return {
          x: Math.min(Math.max(12, prev.x), vw - modalW - 12),
          y: Math.min(Math.max(12, prev.y), vh - modalH - 12)
        };
      });
    }
  }, [isOpen, isExpanded]);

  // Role can be determined by logged-in user or current active view
  const isStaffMode = user?.role === 'STAFF' || currentView === 'staff';

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting based on role
  useEffect(() => {
    if (messages.length === 0) {
      if (isStaffMode) {
        setMessages([
          {
            id: 'init_staff',
            sender: 'bot',
            text: `**Xin chào Chuyên viên ${user?.fullName || 'Nghiệp vụ'}!**\n\nTôi là **Bike Aid Staff AI**. Tôi được tích hợp để đồng hành và hỗ trợ bạn xử lý các ca nghiệp vụ chuyên sâu:\n- 👥 **Khách hàng & Phương tiện**: Tra cứu hồ sơ, biển số, lịch sử vi phạm.\n- 📄 **Hợp đồng (Contract)**: Quy chuẩn duyệt cấp mới, gia hạn, hủy hợp đồng.\n- 🛡️ **Bồi thường (Compensation 2 bước)**: Hướng dẫn thẩm định, phê duyệt số tiền hoặc yêu cầu bổ sung.\n- ⚠️ **Tai nạn & Xử phạt**: Đối chiếu biên bản tai nạn, áp mức phạt chế tài.\n\n*Bạn đang cần tra cứu hoặc xử lý ca nghiệp vụ nào?*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedActions: [
              { label: 'Quy trình duyệt bồi thường 2 bước', action: 'Hướng dẫn chi tiết quy trình duyệt bồi thường 2 bước cho Staff' },
              { label: 'Quy tắc duyệt cấp mới hợp đồng', action: 'Quy tắc thẩm định và duyệt cấp mới hợp đồng xe máy' },
              { label: 'Xử lý hồ sơ tai nạn & phạt chế tài', action: 'Cách xử lý hồ sơ tai nạn và áp dụng mức xử phạt chế tài' },
              { label: 'Tra cứu khách hàng & phương tiện', action: 'Hướng dẫn tra cứu và quản lý khách hàng cùng phương tiện xe máy' }
            ]
          }
        ]);
      } else {
        setMessages([
          {
            id: 'init_user',
            sender: 'bot',
            text: `**Xin chào bạn đến với Bike Aid!**\n\nTôi là **Trợ lý AI Xe máy Thông minh**, sẵn sàng hỗ trợ bạn 24/7:\n- 🛵 **Gói bảo hiểm**: TNDS bắt buộc (Nghị định 67), vật chất 2 chiều, cứu hộ 24/7.\n- 📑 **Hợp đồng điện tử**: Cấp chứng nhận QR chuẩn CSGT trong 2 phút.\n- 🚨 **Khai báo tai nạn & Bồi thường**: Cam kết duyệt bảo lãnh và chi trả nhanh trong **48 giờ**.\n\n*Bạn cần trợ giúp nội dung nào hôm nay?*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedActions: [
              { label: 'Tìm hiểu các gói bảo hiểm', action: 'Giải thích chi tiết các gói bảo hiểm xe máy tại Bike Aid' },
              { label: 'Cách khai báo bồi thường tai nạn', action: 'Hướng dẫn quy trình khai báo tai nạn và nhận tiền bồi thường' },
              { label: 'Cách đăng ký & nhận thẻ QR', action: 'Làm thế nào để đăng ký bảo hiểm và nhận thẻ điện tử QR?' },
              { label: 'Cam kết bồi thường 48h là gì?', action: 'Chính sách cam kết bồi thường và bảo lãnh Gara trong 48 giờ' }
            ]
          }
        ]);
      }
    }
  }, [isStaffMode, user]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // DRAG LOGIC FOR FLOATING BUTTON
  const handleButtonPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only left click / touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const curX = btnPos?.x ?? (window.innerWidth - 220);
    const curY = btnPos?.y ?? (window.innerHeight - 72);

    btnDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: curX,
      origY: curY,
      moved: false
    };
    setIsDraggingBtn(true);
  };

  const handleButtonPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingBtn) return;
    const dx = e.clientX - btnDragRef.current.startX;
    const dy = e.clientY - btnDragRef.current.startY;

    if (Math.hypot(dx, dy) > 4) {
      btnDragRef.current.moved = true;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const newX = Math.min(Math.max(10, btnDragRef.current.origX + dx), vw - 210);
    const newY = Math.min(Math.max(10, btnDragRef.current.origY + dy), vh - 60);

    setBtnPos({ x: newX, y: newY });
  };

  const handleButtonPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingBtn) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    setIsDraggingBtn(false);

    // If wasn't dragged more than threshold, treat as click to open
    if (!btnDragRef.current.moved) {
      setIsOpen(true);
    }
  };

  // DRAG LOGIC FOR CHAT WINDOW HEADER
  const handleChatHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const modalW = isExpanded ? Math.min(620, vw * 0.92) : Math.min(400, vw * 0.92);
    const modalH = isExpanded ? Math.min(720, vh * 0.82) : 540;

    const curX = chatPos?.x ?? (vw - modalW - 24);
    const curY = chatPos?.y ?? (vh - modalH - 24);

    chatDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: curX,
      origY: curY
    };
    setIsDraggingChat(true);
  };

  const handleChatHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingChat) return;
    const dx = e.clientX - chatDragRef.current.startX;
    const dy = e.clientY - chatDragRef.current.startY;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const modalW = isExpanded ? Math.min(620, vw * 0.92) : Math.min(400, vw * 0.92);
    const modalH = isExpanded ? Math.min(720, vh * 0.82) : 540;

    const newX = Math.min(Math.max(10, chatDragRef.current.origX + dx), vw - modalW - 10);
    const newY = Math.min(Math.max(10, chatDragRef.current.origY + dy), vh - modalH - 10);

    setChatPos({ x: newX, y: newY });
  };

  const handleChatHeaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingChat) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    setIsDraggingChat(false);
  };

  // Reset chat position to default bottom-right
  const resetPositionToDefault = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const modalW = isExpanded ? Math.min(620, vw * 0.92) : Math.min(400, vw * 0.92);
    const modalH = isExpanded ? Math.min(720, vh * 0.82) : 540;
    setChatPos({ x: Math.max(12, vw - modalW - 24), y: Math.max(12, vh - modalH - 24) });
    setBtnPos({ x: Math.max(16, vw - 220), y: Math.max(16, vh - 72) });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userRole: isStaffMode ? 'STAFF' : 'CUSTOMER',
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          contextData: {
            currentView,
            userRole: user?.role || 'GUEST',
            userName: user?.fullName || 'Khách vãng lai',
            isStaffMode
          }
        })
      });

      const data = await response.json();
      const botReply = data.reply || 'Xin lỗi, tôi chưa thể trả lời lúc này.';

      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('[AI Chat Error]', err);
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'bot',
        text: '⚠️ Không thể kết nối đến máy chủ AI. Xin hãy kiểm tra lại kết nối mạng hoặc thử lại sau giây lát.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (actionText: string) => {
    handleSendMessage(actionText);
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* =====================================================================
          FLOATING AI BUTTON (Draggable, default Bottom-Right Corner)
         ===================================================================== */}
      {!isOpen && (
        <div
          onPointerDown={handleButtonPointerDown}
          onPointerMove={handleButtonPointerMove}
          onPointerUp={handleButtonPointerUp}
          style={{
            position: 'fixed',
            left: btnPos ? `${btnPos.x}px` : undefined,
            top: btnPos ? `${btnPos.y}px` : undefined,
            right: btnPos ? undefined : '24px',
            bottom: btnPos ? undefined : '24px',
            touchAction: 'none'
          }}
          className={`z-50 select-none ${
            isDraggingBtn ? 'cursor-grabbing scale-105' : 'cursor-grab'
          }`}
        >
          <div className="relative group">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#4461F2] to-[#2541D9] text-white font-bold text-xs shadow-[0_10px_25px_-5px_rgba(68,97,242,0.6)] hover:shadow-[0_12px_30px_-3px_rgba(68,97,242,0.7)] hover:scale-105 active:scale-95 transition-transform duration-200 border-2 border-white/30 backdrop-blur-md">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <span className="whitespace-nowrap">
                {isStaffMode ? 'AI Nghiệp Vụ Staff' : 'Trợ Lý AI Bike Aid'}
              </span>
              <div
                className="opacity-60 group-hover:opacity-100 transition-opacity pl-1 flex items-center"
                title="Kéo để di chuyển tự do trên màn hình"
              >
                <Move className="w-3.5 h-3.5 text-white/80" />
              </div>
            </div>

            {/* Subtle Pulse Badge */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
            </span>
          </div>
        </div>
      )}

      {/* =====================================================================
          EXPANDABLE CHAT WINDOW (Draggable by Header, default Bottom-Right)
         ===================================================================== */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            left: chatPos ? `${chatPos.x}px` : undefined,
            top: chatPos ? `${chatPos.y}px` : undefined,
            right: chatPos ? undefined : '24px',
            bottom: chatPos ? undefined : '24px'
          }}
          className={`z-50 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.3)] border border-neutral-200/90 flex flex-col overflow-hidden ${
            isDraggingChat ? 'transition-none shadow-[0_25px_70px_-10px_rgba(15,23,42,0.45)]' : 'transition-[width,height] duration-200'
          } ${
            isExpanded
              ? 'w-[92vw] sm:w-[620px] h-[82vh] max-h-[720px]'
              : 'w-[92vw] sm:w-[390px] h-[540px]'
          }`}
        >
          {/* Top Header Bar (Draggable Handle) */}
          <div
            onPointerDown={handleChatHeaderPointerDown}
            onPointerMove={handleChatHeaderPointerMove}
            onPointerUp={handleChatHeaderPointerUp}
            style={{ touchAction: 'none' }}
            title="Nhấn và giữ thanh tiêu đề để di chuyển cửa sổ AI"
            className={`px-4 py-3 bg-gradient-to-r from-[#4461F2] via-[#3B54E0] to-[#1E30A8] text-white flex items-center justify-between shadow-sm select-none ${
              isDraggingChat ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <div className="flex items-center gap-2.5 pointer-events-none">
              <div className="w-8 h-8 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                <Bot className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-extrabold tracking-tight">
                    {isStaffMode ? 'Bike Aid Staff AI' : 'Bike Aid Assistant'}
                  </h3>
                  <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black rounded-full bg-white/20 text-white uppercase tracking-wider">
                    {isStaffMode ? 'STAFF MODE' : 'USER AI'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Kéo để di chuyển • Trực tuyến 24/7</span>
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div
              className="flex items-center gap-1 text-white/80"
              onPointerDown={(e) => e.stopPropagation()} // Stop drag when clicking buttons
            >
              <button
                onClick={resetPositionToDefault}
                title="Đặt lại vị trí góc phải dưới"
                className="p-1.5 hover:bg-white/15 rounded-lg transition"
              >
                <Move className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetChat}
                title="Làm mới cuộc trò chuyện"
                className="p-1.5 hover:bg-white/15 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
                className="p-1.5 hover:bg-white/15 rounded-lg transition hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Đóng chat"
                className="p-1.5 hover:bg-white/15 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Indicator Banner */}
          <div className="px-4 py-2 bg-neutral-100 border-b border-neutral-200/70 text-[11px] text-black flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-[#4461F2]">Mục tiêu:</span>
              <span className="truncate">
                {isStaffMode
                  ? 'Hỗ trợ thẩm định Contract, Bồi thường, Tai nạn, Xử phạt'
                  : 'Hỗ trợ tạo Hợp đồng, Khai báo tai nạn, Cam kết bồi thường'}
              </span>
            </div>
            {isStaffMode && onNavigateView && currentView !== 'staff' && (
              <button
                onClick={() => onNavigateView('staff')}
                className="text-[10px] font-bold text-[#4461F2] hover:underline whitespace-nowrap ml-2"
              >
                Vào Bảng Staff →
              </button>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F9FAFB] text-black text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-[#4461F2] text-white rounded-br-xs font-medium'
                      : 'bg-white text-black border border-neutral-200 rounded-bl-xs font-normal'
                  }`}
                >
                  {/* Formatted body text */}
                  <div className="whitespace-pre-wrap break-words space-y-1">
                    {m.text.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return (
                          <h4 key={idx} className="font-extrabold text-sm text-[#4461F2] mt-1 mb-1">
                            {line.replace('### ', '')}
                          </h4>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <div key={idx} className="flex items-start gap-1.5 ml-1">
                            <span className="text-[#4461F2] font-black">•</span>
                            <span>{line.replace('- ', '')}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                        return (
                          <div key={idx} className="font-semibold text-black mt-1">
                            {line}
                          </div>
                        );
                      }
                      return <p key={idx}>{line}</p>;
                    })}
                  </div>

                  <span
                    className={`block text-[10px] mt-1.5 text-right font-medium ${
                      m.sender === 'user' ? 'text-white/70' : 'text-black/40'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {/* Suggested Interactive Quick Buttons */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                    {m.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(act.action)}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-black text-[11px] font-semibold transition-all hover:border-[#4461F2] shadow-2xs text-left"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-black/60 text-xs bg-white p-3 rounded-2xl border border-neutral-200 w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-[#4461F2]" />
                <span className="font-medium">Bike Aid AI đang suy nghĩ & soạn thảo...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions Bar */}
          <div className="px-3 py-1.5 bg-white border-t border-neutral-200 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap scrollbar-none">
            {isStaffMode ? (
              <>
                <button
                  onClick={() => handleSendMessage('Quy trình thẩm định bồi thường gồm những bước nào?')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-black font-medium transition"
                >
                  Quy trình duyệt bồi thường
                </button>
                <button
                  onClick={() => handleSendMessage('Cách duyệt yêu cầu cấp mới hợp đồng xe máy?')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-black font-medium transition"
                >
                  Duyệt cấp mới hợp đồng
                </button>
                <button
                  onClick={() => handleSendMessage('Khi nào thì phạt chế tài khách hàng?')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-black font-medium transition"
                >
                  Mức phạt chế tài
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSendMessage('Tôi bị tai nạn thì làm sao để được bồi thường?')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-black font-medium transition"
                >
                  Bị tai nạn làm thế nào?
                </button>
                <button
                  onClick={() => handleSendMessage('Gói bảo hiểm TNDS bắt buộc giá bao nhiêu?')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-black font-medium transition"
                >
                  Phí bảo hiểm bắt buộc
                </button>
                {onOpenClaimModal && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenClaimModal();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#E5A00D] text-white font-bold transition hover:bg-[#D49206]"
                  >
                    Khai báo tai nạn ngay
                  </button>
                )}
              </>
            )}
          </div>

          {/* Bottom Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isStaffMode
                  ? 'Hỏi quy trình contract, compensation, accident, punishment...'
                  : 'Hỏi về gói bảo hiểm, làm hợp đồng, bồi thường tai nạn...'
              }
              className="flex-1 h-10 px-3.5 rounded-xl bg-[#EAF0F7] text-black placeholder-black/40 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4461F2] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#4461F2] hover:bg-[#3451E0] disabled:opacity-50 text-white flex items-center justify-center shadow-sm transition-all shrink-0"
              title="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
