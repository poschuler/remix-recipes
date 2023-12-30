import { redirect, type ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import ReactModal from "react-modal";
import { z } from "zod";
import {
  DeleteButton,
  ErrorMessage,
  IconInput,
  PrimaryButton,
} from "~/components/form";
import { XIcon } from "~/components/icons";
import db from "~/db.server";
import { useRecipeContext } from "~/routes/app/recipes/$recipeId";
import { canChangeRecipe } from "~/utils/abilities.server";
import { validateForm } from "~/utils/validation";

const updateMealPlanSchema = z.object({
  mealPlanMultiplier: z.preprocess(
    (value) => parseInt(String(value)),
    z.number().min(1)
  ),
});

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const recipeId = String(params.recipeId);
  await canChangeRecipe(request, recipeId);

  const formData = await request.formData();
  const _action = formData.get("_action");

  if (_action === "updateMealPlan") {
    return validateForm(
      formData,
      updateMealPlanSchema,
      async ({ mealPlanMultiplier }) => {
        await db.recipe.update({
          where: { id: recipeId },
          data: { mealPlanMultiplier },
        });
        return redirect("..");
      },
      (errors) => json({ errors }, { status: 400 })
    );
  }

  if (_action === "removeFromMealPlan") {
    await db.recipe.update({
      where: { id: recipeId },
      data: { mealPlanMultiplier: null },
    });

    return redirect("..");
  }

  return null;
};

if (typeof window !== undefined) {
  ReactModal.setAppElement("body");
}

export default function UpdateMealPlanModal() {
  const { recipeName, mealPlanMultiplier } = useRecipeContext();
  const actionData = useActionData<any>();

  return (
    <ReactModal isOpen className="md:h-fit lg:w-1/2 md:mx-auto md:mt-24">
      <div className="p-4 rounded-md bg-white shadow-md">
        <div className="flex justify-between mb-8">
          <h1 className="text-lg font-bold">Update Meal Plan</h1>
          <Link to=".." replace>
            <XIcon />
          </Link>
        </div>
        <Form method="post" reloadDocument>
          <h2 className="mb-2">{recipeName}</h2>
          <IconInput
            icon={<XIcon />}
            defaultValue={mealPlanMultiplier ?? 1}
            type="number"
            autoComplete="off"
            name="mealPlanMultiplier"
          />
          <ErrorMessage>{actionData?.errors?.mealPlanMultiplier}</ErrorMessage>
          <div className="flex justify-end gap-4 mt-8">
            {mealPlanMultiplier !== null ? (
              <DeleteButton name="_action" value="removeFromMealPlan">
                Remove from Meal Plan
              </DeleteButton>
            ) : null}
            <PrimaryButton name="_action" value="updateMealPlan">
              Save
            </PrimaryButton>
          </div>
        </Form>
      </div>
    </ReactModal>
  );
}
