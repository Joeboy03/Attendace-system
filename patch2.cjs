const fs = require('fs');
let code = fs.readFileSync('src/pages/LecturerDashboard.tsx', 'utf8');

const targetStr = `<div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                          <Wallet size={16} />
                        </div>
                        <div>
                          <h3 className="text-slate-800 font-bold text-base">Amount of credit</h3>
                          <p className="text-slate-400 text-xs mt-0.5">Total refund amount with fee</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-end gap-3 mb-6">
                      <h3 className="text-4xl font-bold text-slate-800">$8,945<span className="text-2xl text-slate-400">.89</span></h3>
                      <div className="bg-[#1C7A58] text-white text-[10px] font-bold px-2 py-1 rounded-full mb-1">
                        +12.8%
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 relative overflow-hidden">
                    <button className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors shadow-sm">
                      <ArrowUpRight size={12} />
                    </button>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">Mandatory Payments</h4>
                    <p className="text-slate-400 text-xs mb-4">Recent payments</p>
                    
                    <div className="flex items-center">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="User" className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 relative z-40" />
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" alt="User" className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 -ml-3 relative z-30" />
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" alt="User" className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 -ml-3 relative z-20" />
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="User" className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 -ml-3 relative z-10" />
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-[#1C7A58] text-white text-xs font-bold flex items-center justify-center -ml-3 relative z-0 shadow-sm">
                        +2
                      </div>
                    </div>
                  </div>
                </div>`;

const newQrCard = `<div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-1 flex flex-col justify-between">
                  {activeSession ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="flex justify-between items-center w-full mb-4">
                        <span className="px-3 py-1 bg-green-100 text-[#1C7A58] text-[10px] font-bold rounded-full flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1C7A58] animate-pulse mr-1.5"></span>
                          LIVE SESSION
                        </span>
                        <span className="text-slate-400 text-[10px] font-mono font-bold bg-slate-100 px-2 py-1 rounded-full">
                          Ends: {format(new Date(activeSession.expires_at), 'h:mm a')}
                        </span>
                      </div>
                      <div className="bg-white p-2 border border-slate-200 rounded-2xl shadow-sm mb-3">
                        <QRCodeSVG 
                           value={JSON.stringify({
                             sessionId: activeSession.id,
                             token: activeSession.session_token
                           })} 
                           size={120}
                          level="H"
                        />
                      </div>
                      <p className="text-slate-800 font-mono text-sm font-bold tracking-widest">{activeSession.session_token.split('-')[0].toUpperCase()}</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                              <QrCode size={16} />
                            </div>
                            <div>
                              <h3 className="text-slate-800 font-bold text-base">Session QR</h3>
                              <p className="text-slate-400 text-xs mt-0.5">Start session to view QR</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center py-4 opacity-50">
                          <div className="w-24 h-24 border-4 border-dashed border-slate-200 rounded-2xl flex items-center justify-center mb-3">
                            <Plus size={24} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-bold text-slate-400">No Active Session</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>`;

code = code.replace(targetStr, newQrCard);

// Also need to import QrCode
if (!code.includes('QrCode,')) {
    code = code.replace('LogOut,', 'LogOut, QrCode,');
}

fs.writeFileSync('src/pages/LecturerDashboard.tsx', code);
