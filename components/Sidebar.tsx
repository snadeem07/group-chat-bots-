import React from 'react';
import { BotId } from '../types';
import { BOTS } from '../constants';
import { Settings2, Plus, Users } from 'lucide-react';

interface SidebarProps {
  activeBots: BotId[];
  onToggleBot: (botId: BotId) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeBots, onToggleBot, onOpenSettings }) => {
  return (
    <div className="w-16 md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-center md:justify-start gap-3">
        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
          O
        </div>
        <h1 className="text-white font-bold text-lg hidden md:block tracking-tight">OmniChat</h1>
      </div>

      {/* Active Bots List */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 hidden md:block">
           <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Group</span>
        </div>
        
        <div className="space-y-1 px-2">
          {Object.values(BOTS).map((bot) => {
            const isActive = activeBots.includes(bot.id);
            return (
              <button
                key={bot.id}
                onClick={() => onToggleBot(bot.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group relative
                  ${isActive ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}
                `}
              >
                <div className="relative">
                   <img 
                     src={bot.avatar} 
                     alt={bot.name} 
                     className={`w-8 h-8 rounded-full bg-white p-0.5 transition-transform duration-200 ${isActive ? 'scale-110' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`} 
                   />
                   {isActive && (
                     <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
                   )}
                </div>
                
                <div className="hidden md:flex flex-col items-start">
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {bot.name}
                  </span>
                  <span className="text-[10px] text-gray-500 leading-none">
                    {bot.defaultModel.split('-')[0]}
                  </span>
                </div>

                {/* Mobile/Collapsed tooltip would go here */}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-800 space-y-2">
         <button 
           onClick={() => activeBots.length === Object.keys(BOTS).length ? activeBots.forEach(b => onToggleBot(b)) : Object.keys(BOTS).forEach(b => !activeBots.includes(b as BotId) && onToggleBot(b as BotId))}
           className="w-full flex items-center justify-center md:justify-start gap-3 p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
         >
           <Users size={20} />
           <span className="hidden md:inline text-sm font-medium">
              {activeBots.length === Object.keys(BOTS).length ? 'Deselect All' : 'Select All'}
           </span>
         </button>

        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center md:justify-start gap-3 p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Settings2 size={20} />
          <span className="hidden md:inline text-sm font-medium">Settings & Keys</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
