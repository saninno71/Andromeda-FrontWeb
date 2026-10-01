-- =========================================================================================================
-- Author: Facundo Perez
-- Create date: Mayo 2022
-- Description:	Cada vez que se modifica un comprobante se retrocede en la numeracion hasta el numero
--				de comprobante mas alto, de no existir mas comprobantes para dicha numeracion solo
--				se resta uno al numero.
-- =========================================================================================================
ALTER TRIGGER [dbo].[gnrComprobantes_Mod_trigger]
ON [dbo].[gnrComprobantes]
FOR UPDATE
AS 
BEGIN

	SET NOCOUNT ON;
		
	SELECT ID FROM Deleted

	IF @@ROWCOUNT = 1 BEGIN		--Solo se dispara el Trigger si se elimina un solo registro. 

		declare @NumeroViejo int, @NumeracionIDViejo int, @NumeradorTipoViejo int, @NumeracionNumViejo int
		declare @NumeroNuevo int, @NumeracionIDNuevo int, @NumeradorTipoNuevo int, @NumeracionNumNuevo int

		SELECT @NumeroViejo = deleted.Numero, @NumeracionIDViejo = gnrNumeraTipos.NumeracionID, 
			@NumeradorTipoViejo = gnrNumeraciones.NumeradorTipo, @NumeracionNumViejo = ISNULL(gnrNumeraciones.Numero, 0)
		FROM deleted 
			INNER JOIN gnrNumeraTipos ON gnrNumeraTipos.ID = deleted.NumeraTipoID
			INNER JOIN gnrNumeraciones ON gnrNumeraciones.ID = gnrNumeraTipos.NumeracionID

		SELECT @NumeroNuevo = inserted.Numero, @NumeracionIDNuevo = gnrNumeraTipos.NumeracionID, 
			@NumeradorTipoNuevo = gnrNumeraciones.NumeradorTipo, @NumeracionNumNuevo = ISNULL(gnrNumeraciones.Numero, 0)
		FROM inserted 
			INNER JOIN gnrNumeraTipos ON gnrNumeraTipos.ID = inserted.NumeraTipoID
			INNER JOIN gnrNumeraciones ON gnrNumeraciones.ID = gnrNumeraTipos.NumeracionID

		--Solo se dispara si se modifica la Numeracion o el Numero.
		IF (@NumeroNuevo <> @NumeroViejo) OR (@NumeracionIDNuevo <> @NumeracionIDViejo) BEGIN
			--Actualiza si es el proximo numero de la numeración y si la numeración no es manual.
			IF (@NumeroNuevo = @NumeracionNumNuevo + 1) AND (@NumeradorTipoNuevo <> 1) BEGIN
				UPDATE gnrNumeraciones SET Numero = @NumeroNuevo WHERE ID = @NumeracionIDNuevo
			END

			IF (@NumeracionIDNuevo <> @NumeracionIDViejo) AND (@NumeroViejo = @NumeracionNumViejo) AND (@NumeradorTipoViejo <> 1)  BEGIN
				declare @UltimoNumeroViejo int

				--Obtiene el ultimo numero de comprobante generado
				SELECT TOP 1 @UltimoNumeroViejo = gnrComprobantes.Numero FROM gnrComprobantes
					INNER JOIN gnrNumeraTipos ON gnrNumeraTipos.ID = gnrComprobantes.NumeraTipoID
				WHERE gnrNumeraTipos.NumeracionID = @NumeracionIDViejo
				ORDER BY gnrComprobantes.Numero DESC

				UPDATE gnrNumeraciones SET Numero = IIf(@UltimoNumeroViejo Is Null, 0, @UltimoNumeroViejo)
				WHERE gnrNumeraciones.ID = @NumeracionIDViejo		
			END
		END

	END
	
END