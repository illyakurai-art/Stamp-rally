"use client"

import { CalendarDays, MapPin, Link2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export function TeamMemberCard() {
  return (
    <div className="flex items-center justify-center p-8 bg-secondary/40 text-foreground rounded-lg">
      <p className="text-muted-foreground text-sm">
        Created by{" "}
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="text-foreground underline underline-offset-4 cursor-pointer font-medium hover:text-foreground/70 transition-colors">
              @shadcn
            </span>
          </HoverCardTrigger>
          
          <HoverCardContent className="w-80 bg-card border-border text-foreground p-4 rounded-xl shadow-xl">
            <div className="flex space-x-4">
              {/* Avatar circolare dell'utente */}
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              
              <div className="space-y-3 flex-1">
                {/* Nome utente */}
                <div>
                  <h4 className="text-sm font-semibold leading-none">@shadcn</h4>
                </div>
                
                {/* Descrizione / Bio */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Building beautiful and accessible user interfaces.
                </p>
                
                {/* Informazioni aggiuntive (Data, Luogo, Sito) */}
                <div className="space-y-1.5 pt-1 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-3.5 w-3.5 stroke-[1.5]" />
                    <span>Joined March 2021</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-3.5 w-3.5 stroke-[1.5]" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center">
                    <Link2 className="mr-2 h-3.5 w-3.5 stroke-[1.5] text-foreground/60" />
                    <a 
                      href="https://ui.shadcn.com" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="hover:underline text-foreground/60"
                    >
                      ui.shadcn.com
                    </a>
                  </div>
                </div>
                
                {/* Contatori Follower / Following */}
                <div className="flex space-x-4 pt-2 border-t border-border text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-foreground">12.5k</span>
                    <span className="text-muted-foreground">followers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-foreground">542</span>
                    <span className="text-muted-foreground">following</span>
                  </div>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </p>
    </div>
  )
}
