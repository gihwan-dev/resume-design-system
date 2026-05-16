import type { Block } from '../types';
import type { CareerData, PAR, Project } from './types';
import { uid } from '../../lib/uid';
import { Field, IconBtn, RT_HINT, TextArea, TextInput } from '../../app/Inspector/primitives';

function makePar(): PAR {
  return { id: uid('par'), label: '', problem: '', action: '', result: '', learning: '' };
}
function makeProject(): Project {
  return {
    id: uid('prj'),
    title: '프로젝트 제목',
    period: '',
    stack: '',
    pars: [makePar()],
  };
}

export function CareerForm({
  block,
  update,
}: {
  block: Block<'career'>;
  update: (patch: Partial<CareerData>) => void;
}) {
  const d = block.data;
  const projects = d.projects ?? [];

  const patchProject = (id: string, patch: Partial<Project>) =>
    update({ projects: projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const removeProject = (id: string) => update({ projects: projects.filter((p) => p.id !== id) });
  const moveProject = (id: string, dir: -1 | 1) => {
    const arr = [...projects];
    const i = arr.findIndex((p) => p.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    update({ projects: arr });
  };

  const patchPar = (prjId: string, parId: string, patch: Partial<PAR>) =>
    patchProject(prjId, {
      pars: projects
        .find((p) => p.id === prjId)!
        .pars.map((par) => (par.id === parId ? { ...par, ...patch } : par)),
    });
  const removePar = (prjId: string, parId: string) =>
    patchProject(prjId, {
      pars: projects.find((p) => p.id === prjId)!.pars.filter((par) => par.id !== parId),
    });
  const movePar = (prjId: string, parId: string, dir: -1 | 1) => {
    const prj = projects.find((p) => p.id === prjId)!;
    const arr = [...prj.pars];
    const i = arr.findIndex((p) => p.id === parId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    patchProject(prjId, { pars: arr });
  };

  return (
    <div className="field-group">
      <Field label="회사">
        <TextInput value={d.company} onChange={(v) => update({ company: v })} />
      </Field>
      <Field label="역할">
        <TextInput value={d.role} onChange={(v) => update({ role: v })} />
      </Field>
      <Field label="기간">
        <TextInput
          value={d.period}
          onChange={(v) => update({ period: v })}
          placeholder="2024.01 — 현재"
          mono
        />
      </Field>
      <Field label="회사 요약 (선택)" hint={RT_HINT}>
        <TextArea rows={3} value={d.summary} onChange={(v) => update({ summary: v })} />
      </Field>

      <div className="panel-section-title" style={{ marginTop: 12 }}>
        프로젝트
      </div>

      {projects.map((prj, i) => (
        <div key={prj.id} className="sub-card">
          <div className="sub-card-head">
            <div className="sub-card-title">Project {String(i + 1).padStart(2, '0')}</div>
            <div style={{ display: 'flex', gap: 2 }}>
              <IconBtn title="위로" onClick={() => moveProject(prj.id, -1)} disabled={i === 0}>
                ↑
              </IconBtn>
              <IconBtn
                title="아래로"
                onClick={() => moveProject(prj.id, 1)}
                disabled={i === projects.length - 1}
              >
                ↓
              </IconBtn>
              <IconBtn title="삭제" onClick={() => removeProject(prj.id)} danger>
                ×
              </IconBtn>
            </div>
          </div>
          <Field label="제목">
            <TextInput value={prj.title} onChange={(v) => patchProject(prj.id, { title: v })} />
          </Field>
          <Field label="기간">
            <TextInput
              value={prj.period}
              onChange={(v) => patchProject(prj.id, { period: v })}
              mono
            />
          </Field>
          <Field label="스택" hint="쉼표(,)로 구분해서 적으면 · 로 표시돼요">
            <TextInput
              value={prj.stack}
              onChange={(v) => patchProject(prj.id, { stack: v })}
              placeholder="React, TypeScript, Vite"
              mono
            />
          </Field>

          <div className="panel-section-title" style={{ marginTop: 10 }}>
            PAR(L) blocks
          </div>
          {prj.pars.map((par, pi) => (
            <div key={par.id} className="sub-card" style={{ background: 'transparent' }}>
              <div className="sub-card-head">
                <div className="sub-card-title">PAR {String(pi + 1).padStart(2, '0')}</div>
                <div style={{ display: 'flex', gap: 2 }}>
                  <IconBtn
                    title="위로"
                    onClick={() => movePar(prj.id, par.id, -1)}
                    disabled={pi === 0}
                  >
                    ↑
                  </IconBtn>
                  <IconBtn
                    title="아래로"
                    onClick={() => movePar(prj.id, par.id, 1)}
                    disabled={pi === prj.pars.length - 1}
                  >
                    ↓
                  </IconBtn>
                  <IconBtn title="삭제" onClick={() => removePar(prj.id, par.id)} danger>
                    ×
                  </IconBtn>
                </div>
              </div>
              <Field label="라벨 (선택)">
                <TextInput
                  value={par.label}
                  onChange={(v) => patchPar(prj.id, par.id, { label: v })}
                />
              </Field>
              <Field label="PROBLEM" hint={RT_HINT}>
                <TextArea
                  rows={2}
                  value={par.problem}
                  onChange={(v) => patchPar(prj.id, par.id, { problem: v })}
                />
              </Field>
              <Field label="ACTION" hint={RT_HINT}>
                <TextArea
                  rows={2}
                  value={par.action}
                  onChange={(v) => patchPar(prj.id, par.id, { action: v })}
                />
              </Field>
              <Field label="RESULT" hint={RT_HINT}>
                <TextArea
                  rows={2}
                  value={par.result}
                  onChange={(v) => patchPar(prj.id, par.id, { result: v })}
                />
              </Field>
              <Field label="LEARNING" hint={RT_HINT}>
                <TextArea
                  rows={2}
                  value={par.learning}
                  onChange={(v) => patchPar(prj.id, par.id, { learning: v })}
                />
              </Field>
            </div>
          ))}
          <button
            type="button"
            className="btn"
            onClick={() => patchProject(prj.id, { pars: [...prj.pars, makePar()] })}
          >
            + PAR 추가
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn"
        onClick={() => update({ projects: [...projects, makeProject()] })}
      >
        + 프로젝트 추가
      </button>
    </div>
  );
}
