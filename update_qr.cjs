const fs = require('fs');
let code = fs.readFileSync('src/pages/LecturerDashboard.tsx', 'utf8');

const qrCard = `
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-1 flex flex-col justify-between">
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
                              <Wallet size={16} />
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
                </div>
`;

// Replace the bottom right card logic
code = code.replace(/<div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-1 flex flex-col justify-between">[\s\S]*?(?=<\/div>\s*<\/div>\s*\{\/\* Bottom Table \*\/})/g, qrCard + '\n              ');

fs.writeFileSync('src/pages/LecturerDashboard.tsx', code);
