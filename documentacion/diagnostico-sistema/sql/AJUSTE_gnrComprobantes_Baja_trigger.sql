-- Evita que el trigger de baja emita el ID eliminado como un conjunto de resultados.
-- Entity Framework usa el contador de filas para validar el DELETE y confundia ese ID
-- con la cantidad de filas afectadas.
ALTER TRIGGER [dbo].[gnrComprobantes_Baja_trigger]
ON [dbo].[gnrComprobantes]
FOR DELETE
AS
BEGIN

	SET NOCOUNT ON;

	IF (SELECT COUNT(*) FROM Deleted) = 1 BEGIN		--Solo se dispara el Trigger si se elimina un solo registro.

		declare @Numero int = (SELECT Numero FROM Deleted)
		declare @NumeracionNumero int =
				(SELECT gnrNumeraciones.Numero FROM Deleted
				INNER JOIN gnrNumeraTipos ON gnrNumeraTipos.ID = Deleted.NumeratipoID
				INNER JOIN gnrNumeraciones ON gnrNumeraciones.ID = gnrNumeraTipos.NumeracionID
				WHERE gnrNumeraTipos.Tipo <> dbo.enm('enmTCcpsProvisorio'))

		IF (@Numero = ISNULL(@NumeracionNumero, 0)) BEGIN
			declare @UltimoNumero int =
				(SELECT TOP 1 gnrComprobantes.Numero FROM gnrComprobantes
				INNER JOIN gnrNumeraTipos ON gnrNumeraTipos.ID = gnrComprobantes.NumeraTipoID
				INNER JOIN gnrNumeraciones ON gnrNumeraciones.ID = gnrNumeraTipos.NumeracionID
				WHERE gnrNumeraciones.ID =
					(SELECT gnrNumeraTipos.NumeracionID FROM Deleted
					INNER JOIN gnrNumeraTipos ON gnrNumeraTipos.ID = Deleted.NumeratipoID)
				ORDER BY gnrComprobantes.Numero DESC)

			UPDATE gnrNumeraciones
			SET Numero = IIf(@UltimoNumero Is Null, 0, @UltimoNumero)
			WHERE gnrNumeraciones.ID =
				(SELECT gnrNumeraTipos.NumeracionID FROM Deleted
				INNER JOIN gnrNumeraTipos ON gnrNumeraTipos.ID = Deleted.NumeraTipoID)
		END
	END
END
