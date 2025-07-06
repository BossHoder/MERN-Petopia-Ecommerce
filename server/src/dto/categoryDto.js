/**
 * Category Data Transfer Objects
 * Transform database Category model to client-friendly format
 */

export const categoryDto = (category) => {
    return {
        id: category._id,
        name: category.name,
        slug: category.slug,
        parentCategory: category.parentCategory,
        iconUrl: category.iconUrl,
        description: category.description,
        isPublished: category.isPublished,
        sortOrder: category.sortOrder,
        productCount: category.productCount,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
    };
};

export const categoriesDto = (categories) => {
    return categories.map(category => categoryDto(category));
};

// Simplified DTO for dropdown/selection lists
export const categorySimpleDto = (category) => {
    return {
        id: category._id,
        name: category.name,
        slug: category.slug,
        iconUrl: category.iconUrl,
        productCount: category.productCount
    };
};

export const categoriesSimpleDto = (categories) => {
    return categories.map(category => categorySimpleDto(category));
};

// DTO for nested category tree structure
export const categoryTreeDto = (category, children = []) => {
    return {
        ...categoryDto(category),
        children: children.map(child => categoryDto(child))
    };
};
