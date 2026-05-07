"use client";

import { CheckCircle2, ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { PendingButton } from "@/components/ui/pending-button";
import {
  checklistTypes,
  type ChecklistTemplateItem,
  type ChecklistType,
  type EffectiveChecklistTemplate
} from "@/lib/investment-system/constants";

const maxItemsPerTemplate = 20;

type SaveChecklistTemplateAction = (formData: FormData) => void | Promise<void>;

type EditableTemplateItem = ChecklistTemplateItem & {
  rowKey: string;
};

type EditableTemplate = {
  title: string;
  items: EditableTemplateItem[];
};

type TemplatesState = Record<ChecklistType, EditableTemplate>;

export function ChecklistTemplateEditor({
  templates,
  saveAction
}: {
  templates: Record<ChecklistType, EffectiveChecklistTemplate>;
  saveAction: SaveChecklistTemplateAction;
}) {
  const [drafts, setDrafts] = useState<TemplatesState>(() => createInitialDrafts(templates));

  function updateTitle(type: ChecklistType, title: string) {
    setDrafts((current) => ({
      ...current,
      [type]: {
        ...current[type],
        title
      }
    }));
  }

  function updateItem(type: ChecklistType, rowKey: string, values: Partial<ChecklistTemplateItem>) {
    setDrafts((current) => ({
      ...current,
      [type]: {
        ...current[type],
        items: current[type].items.map((item) => (item.rowKey === rowKey ? { ...item, ...values } : item))
      }
    }));
  }

  function addItem(type: ChecklistType) {
    setDrafts((current) => {
      const currentItems = current[type].items;

      if (currentItems.length >= maxItemsPerTemplate) {
        return current;
      }

      const nextNumber = currentItems.length + 1;

      return {
        ...current,
        [type]: {
          ...current[type],
          items: [
            ...currentItems,
            {
              rowKey: crypto.randomUUID(),
              id: `${type}_${Date.now()}_${nextNumber}`,
              text: "",
              category: "通用",
              required: false
            }
          ]
        }
      };
    });
  }

  function removeItem(type: ChecklistType, rowKey: string) {
    setDrafts((current) => {
      const currentItems = current[type].items;

      if (currentItems.length <= 1) {
        return current;
      }

      return {
        ...current,
        [type]: {
          ...current[type],
          items: currentItems.filter((item) => item.rowKey !== rowKey)
        }
      };
    });
  }

  return (
    <section className="page-panel rounded-lg p-6">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">自定义检查清单</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        修改模板后，新的检查会使用自定义项；历史检查记录保留当时保存的项目，不会被改写。
      </p>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {checklistTypes.map((typeMeta) => {
          const type = typeMeta.value as ChecklistType;
          const template = templates[type];
          const draft = drafts[type];
          const persistedState = template.isCustom ? "已自定义" : "默认";
          const itemCountText = `${draft.items.length} 项`;
          const canRemove = draft.items.length > 1;
          const canAdd = draft.items.length < maxItemsPerTemplate;
          const itemsPayload = JSON.stringify(
            draft.items.map((item) => ({
              id: item.id,
              text: item.text,
              category: item.category,
              required: item.required
            }))
          );

          return (
            <details key={type} className="rounded-lg border border-border bg-background p-4" open={type === "buy"}>
              <summary className="cursor-pointer text-sm font-semibold">
                {typeMeta.label}
                <span className="ml-2 text-xs text-muted-foreground">
                  {persistedState} / {itemCountText}
                </span>
              </summary>
              <form action={saveAction} className="mt-4 space-y-4">
                <input type="hidden" name="checklistType" value={type} />
                <input type="hidden" name="itemsJson" value={itemsPayload} />

                <label className="block">
                  <span className="text-sm font-semibold">模板名称</span>
                  <input
                    value={draft.title}
                    onChange={(event) => updateTitle(type, event.target.value)}
                    name="title"
                    className="mt-2 w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary"
                  />
                </label>

                <div className="space-y-3">
                  {draft.items.map((item, index) => (
                    <div key={item.rowKey} className="rounded-md border border-border bg-card p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs font-semibold text-primary">检查问题 {index + 1}</div>
                        <button
                          type="button"
                          onClick={() => removeItem(type, item.rowKey)}
                          disabled={!canRemove}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`删除${typeMeta.label}检查问题 ${index + 1}`}
                          title="删除检查项"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <div className="mt-2 grid gap-3 md:grid-cols-[1fr_120px]">
                        <label className="block">
                          <span className="sr-only">检查问题</span>
                          <input
                            value={item.text}
                            onChange={(event) => updateItem(type, item.rowKey, { text: event.target.value })}
                            placeholder="输入检查问题"
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                          />
                        </label>
                        <label className="block">
                          <span className="sr-only">分类</span>
                          <input
                            value={item.category}
                            onChange={(event) => updateItem(type, item.rowKey, { category: event.target.value })}
                            placeholder="通用"
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                          />
                        </label>
                      </div>
                      <label className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={item.required}
                          onChange={(event) => updateItem(type, item.rowKey, { required: event.target.checked })}
                        />
                        关键项
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addItem(type)}
                    disabled={!canAdd}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    新增检查项
                  </button>
                  <PendingButton
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                    pendingChildren="保存中..."
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    保存模板
                  </PendingButton>
                </div>
              </form>
            </details>
          );
        })}
      </div>
    </section>
  );
}

function createInitialDrafts(templates: Record<ChecklistType, EffectiveChecklistTemplate>) {
  return checklistTypes.reduce((drafts, typeMeta) => {
    const type = typeMeta.value as ChecklistType;
    const template = templates[type];

    drafts[type] = {
      title: template.title,
      items: template.items.map((item) => ({
        ...item,
        rowKey: `${type}-${item.id}`
      }))
    };

    return drafts;
  }, {} as TemplatesState);
}
