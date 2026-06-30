import React, { useRef, useState, useEffect, WheelEvent } from "react";
import {
  RhythmKits,
  RhythmConfig,
  RhythmLockKey,
  RhythmLockState
} from "../midi/rc600Rhythm";

type RhythmPanelProps = {
  config: RhythmConfig;
  locks: RhythmLockState;
  onChange: (config: RhythmConfig) => void;
  onRandomize: () => void;
  lockKey?: RhythmLockKey;
  isLocked?: boolean;
  toggleLock?: (field: RhythmLockKey) => void;
};

type DialProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  size?: number;
  label?: string;
  onChange: (v: number) => void;
  renderCenter?: (v: number) => React.ReactNode;
  lockKey?: RhythmLockKey;
  isLocked?: boolean;
  toggleLock?: (field: RhythmLockKey) => void;
};

const Dial: React.FC<DialProps> = ({ value, min, max, step = 1, size = 120, label, onChange, renderCenter, lockKey, isLocked, toggleLock }) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);

  const startAngle = 150; // min at ~10 o'clock after rotation
  const endAngle = 30; // max at ~2 o'clock after rotation
  const span = (endAngle - startAngle + 360) % 360 || 360;

  const valueToAngle = (v: number) => {
    const t = (v - min) / (max - min);
    return (startAngle + t * span) % 360;
  };

  const angleToValue = (angle: number) => {
    const a = ((angle - startAngle + 360) % 360) / span;
    let v = min + a * (max - min);
    if (step) v = Math.round(v / step) * step;
    //console.log(Math.max(min, Math.min(max, v)));
    return Math.max(min, Math.min(max, v));
  };

  const handlePointer = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    const deg = (ang + 360) % 360;
    const v = angleToValue(deg);
    //console.log("Handling pointer at", el, rect, cx, cy, dx, dy, ang, deg, v, clientX, clientY);
    onChange(v);
  };

  useEffect(() => {
    // Cleanup is handled by SVG event handlers, no global listeners needed
    return () => {};
  }, []);

  const radius = size / 2;
  const stroke = Math.max(6, Math.round(size * 0.08));
  const innerR = radius - stroke - 6;
  const angle = valueToAngle(value);
  const rad = (angle * Math.PI) / 180;
  const x = radius + Math.cos(rad) * innerR;
  const y = radius + Math.sin(rad) * innerR;

  const arcPath = () => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = radius + Math.cos(startRad) * innerR;
    const y1 = radius + Math.sin(startRad) * innerR;
    const x2 = radius + Math.cos(endRad) * innerR;
    const y2 = radius + Math.sin(endRad) * innerR;
    const large = span > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${innerR} ${innerR} 0 ${large} 1 ${x2} ${y2}`;
  };

  const progressPath = () => {
    const t = (value - min) / (max - min);
    const ang = (startAngle + span * t) % 360;
    const startRad = (startAngle * Math.PI) / 180;
    const angRad = (ang * Math.PI) / 180;
    const x1 = radius + Math.cos(startRad) * innerR;
    const y1 = radius + Math.sin(startRad) * innerR;
    const x2 = radius + Math.cos(angRad) * innerR;
    const y2 = radius + Math.sin(angRad) * innerR;
    const large = ((span * t) > 180) ? 1 : 0;
    return `M ${x1} ${y1} A ${innerR} ${innerR} 0 ${large} 1 ${x2} ${y2}`;
  };

  const renderTicks = () => {
    const tickLength = Math.max(6, stroke);
    const outerR = radius - stroke / 2;
    const tickInnerR = outerR - tickLength;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1Start = radius + Math.cos(startRad) * outerR;
    const y1Start = radius + Math.sin(startRad) * outerR;
    const x2Start = radius + Math.cos(startRad) * tickInnerR;
    const y2Start = radius + Math.sin(startRad) * tickInnerR;
    
    const x1End = radius + Math.cos(endRad) * outerR;
    const y1End = radius + Math.sin(endRad) * outerR;
    const x2End = radius + Math.cos(endRad) * tickInnerR;
    const y2End = radius + Math.sin(endRad) * tickInnerR;
    
    return (
      <>
        <line x1={x1Start} y1={y1Start} x2={x2Start} y2={y2Start} stroke={isLocked ? "red" : "#0ee827"} strokeWidth={2} />
        <line x1={x1End} y1={y1End} x2={x2End} y2={y2End} stroke={isLocked ? "red" : "#dad00a"} strokeWidth={2} />
      </>
    );
  };

  const handleWheel = (event: React.KeyboardEvent<SVGSVGElement>) => {
    if ((!lockKey || lockKey.trim() === "") || !toggleLock) return;
    const e = event as unknown as WheelEvent;
    let newValue = value;
    if (e.deltaY < 0) {
      newValue = Math.min(max, value + step);
      onChange(newValue);
      e.preventDefault();
    } else if (e.deltaY > 0) {
      newValue = Math.max(min, value - step);
      onChange(newValue);
      e.preventDefault();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    if ((!lockKey || lockKey.trim() === "") || !toggleLock) return;
    let newValue = value;
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      newValue = Math.min(max, value + step);
      onChange(newValue);
      event.preventDefault();
    } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      newValue = Math.max(min, value - step);
      onChange(newValue);
      event.preventDefault();
    }
  };

  const handleToggleLock = () => {
    if ((!lockKey || lockKey.trim() === "") || !toggleLock) return;
    toggleLock(lockKey);
  };

  const svgDialAttrs = {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    tabIndex: 0,
    onKeyDown: handleKeyDown,
    onWheel: handleWheel,
    style:{
      display: "block",
      margin: "0 auto",
      cursor: "crosshair",
      outline: "none",
      touchAction: "none" },
  };

  return (
    <div>
      <svg
        ref={ref}
        {...svgDialAttrs}
        onDoubleClick={() => handleToggleLock()}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          draggingRef.current = true;
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!draggingRef.current || isLocked) return;
          handlePointer(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          draggingRef.current = false;
          try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch {}
        }}
        onWheel={(e: WheelEvent<SVGSVGElement>) => {
          // Your logic here
          // handleWheel(e as unknown as React.KeyboardEvent<SVGSVGElement>);
        }}

      >
        <circle
          cx={radius}
          cy={radius}
          r={innerR}
          stroke="none"
          strokeWidth={0}
          fill="none"
        />
        <path d={arcPath()} stroke="#444" strokeWidth={stroke} fill="none" strokeLinecap="round" />
        <path d={progressPath()} stroke={isLocked ? "red" : "#0a74da"} strokeWidth={stroke} fill="none" strokeLinecap="round" />
        {renderTicks()}
      </svg>
      <div className="text" style={{ marginTop: 6, fontSize: 12 }}>
        <div className="label" style={{ fontWeight: 600 }}>{label}</div>
        <div className="value" style={{ fontSize: 11 }}>{renderCenter ? renderCenter(value) : value}</div>
      </div>
    </div>
  );
};

export const RhythmPanel: React.FC<RhythmPanelProps> = ({ config, locks, toggleLock, onChange, onRandomize, lockKey, isLocked }) => {
  const lockFields: Array<{ key: RhythmLockKey; label: string }> = [
    { key: "kit", label: "Kit" },
    { key: "level", label: "Level" },
    { key: "tempo", label: "Tempo" },
    { key: "fineTempo", label: "Fine Tempo" },
  ];

  const handleToggleLock = (key?: RhythmLockKey) => {
    if ((!key || key.trim() === "") || !toggleLock) return;
    toggleLock(key);
  };

  return (
    <div className="rhythm-panel">
      <h3>Rhythm Control</h3>

      <div className="button-controls-container">
        <div className="control-group">
          <label>Kit</label>
          <div>
            <Dial
              size={120}
              min={0}
              max={RhythmKits.length - 1}
              step={1}
              value={Math.max(0, RhythmKits.indexOf(config.kit))}
              onChange={(v) => onChange({ ...config, kit: RhythmKits[Math.round(v)] })}
              renderCenter={(v) => RhythmKits[Math.round(v)]}
              isLocked={locks.kit}
              lockKey="kit"
              toggleLock={toggleLock}
            />
          </div>
        </div>

        <div className="control-group">
          <label>Level</label>
          <div>
            <Dial
              size={120}
              min={0}
              max={127}
              step={1}
              value={config.level}
              onChange={(v) => onChange({ ...config, level: Math.round(v) })}
              renderCenter={(v) => Math.round(v)}
              isLocked={locks.level}
              lockKey="level"
              toggleLock={toggleLock}
            />
          </div>
        </div>

        <div className="control-group">
          <label>Tempo (BPM)</label>
          <div>
            <div className="tempo-wrap">
              <div className="tempo-dial-wrap">
                <Dial
                  size={120}
                  min={40}
                  max={300}
                  step={1}
                  value={config.tempo}
                  onChange={(v) => onChange({ ...config, tempo: Math.round(v) })}
                  renderCenter={(v) => Math.round(v)}
                  isLocked={locks.tempo}
                  lockKey="tempo"
                  toggleLock={toggleLock}
                />
              </div>
              <div className="fine-tempo-dial-wrap">
                <Dial
                  size={90}
                  min={0}
                  max={9}
                  value={config.fineTempo}
                  onChange={(v) => onChange({ ...config, fineTempo: Math.round(v) })}
                  renderCenter={(v) => `.${Math.round(v)}`}
                  isLocked={locks.fineTempo}
                  lockKey="fineTempo"
                  toggleLock={toggleLock}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          {lockFields.map((field) => {
            const toggleLockButtonAttrs = {
              type: "button",
              className: locks[field.key] ? "lock-button locked inactive" : "lock-button active",
              onClick: () => handleToggleLock(field.key),
            } as const;

            return (
              <button key={field.key} {...toggleLockButtonAttrs}>
                {locks[field.key] ? `🔒 ${field.label}` : `🔓 ${field.label}`}
              </button>
            );
          })}

        <button
          className="btn-randomize"
          type="button"
          onClick={onRandomize}
        >
          🎲 Randomize Rhythm
        </button>
      </div>
    </div>
  </div>
  );
}
